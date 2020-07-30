/* eslint-disable @typescript-eslint/naming-convention */
import bodyParser from "body-parser";
import { Request } from "express";
import {
  BadRequestError, Body, CurrentUser, ForbiddenError, HeaderParam, InternalServerError, JsonController, Post, Req, UseBefore
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import Stripe from "stripe";
import { FindOneOptions } from "typeorm";

import Roblox from "../../api/roblox/Roblox";
import { stripeGroupPriceId } from "../../constants";
import database from "../../database";
import { Integration, User } from "../../entities";
import { IntegrationType } from "../../entities/Integration.entity";
import stripe from "../../shared/stripe";
import { integrationDefault, integrationMeta } from "../IntegrationController/types";
import { CompleteSubscriptionResponse, SessionBody, SessionResponse } from "./types";

@JsonController("/payments")
export default class PaymentController {
  @Post("/session")
  @ResponseSchema(SessionResponse)
  async createSession (
    @Body() { groupId, integrations }: SessionBody,
    @Req() { groupService }: Request,
    @CurrentUser({ required: true }) user: User
  ): Promise<SessionResponse> {
    if (!user.emailVerified) throw new ForbiddenError("Email not verified");

    const group = await groupService.canAccessGroup(groupId, false);
    if (group.stripeSubscriptionId) throw new BadRequestError("Group already has a subscription");

    const { name } = await Roblox.getGroup(group.robloxId) || {};

    const integrationItems: Stripe.Checkout.SessionCreateParams.LineItem[] = integrations.map(integration => ({
      quantity: 1,
      price: integrationMeta[integration].stripePriceId
    }));

    const { id } = await stripe.checkout.sessions.create({
      // Stripe only allows one of the two following
      // Stripe complains if value is `null` (thus make sure to set it to `undefined` instead)
      // `||` because `??` does not do anything for booleans
      customer_email: (!user.stripeCustomerId && user.email) || undefined,
      customer: user.stripeCustomerId ?? undefined,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripeGroupPriceId,
          quantity: 1,
          description: `Group plan for ${name || group.robloxId}`
        },
        ...integrationItems
      ],
      mode: "subscription",
      metadata: { groupId: group.id },
      success_url: `${process.env.frontendUrl}/dashboard/groups/${group.id}?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.frontendUrl}/dashboard/subscribe/${group.id}?success=false`
    });

    return { sessionId: id };
  }

  // Stripe webhook
  @Post("/complete")
  @UseBefore(bodyParser.raw({ type: "application/json" }))
  @ResponseSchema(CompleteSubscriptionResponse)
  async completeSubscription (
    @HeaderParam("stripe-signature") stripeSig: string,
    @Body() body: any,
    @Req() { groupService }: Request
  ): Promise<CompleteSubscriptionResponse> {
    const { paymentCompleteStripeSecret } = process.env;
    if (!paymentCompleteStripeSecret) throw new InternalServerError("Fatal configuration error");

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, stripeSig, paymentCompleteStripeSecret);
    } catch (e) {
      throw new BadRequestError(e.message);
    }

    if (event.type !== "checkout.session.completed") throw new BadRequestError("Invalid event type");

    const session = event.data.object as Stripe.Checkout.Session;

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    // If user already has a customer ID, Stripe allows them to change their email.
    // Thus we need to query by customer ID as well
    // (it should never be null from Stripe, but going to assume it might be null for some reason).
    const query: FindOneOptions<User>["where"] = customerId
      ? [{ stripeCustomerId: customerId }, { email: session.customer_email }]
      : { email: session.customer_email };
    const user = await database.users.findOne({ where: query });

    if (!user) throw new BadRequestError("User not found");
    if (!user.emailVerified) throw new BadRequestError("Email not verified");

    if (!session.metadata || !session.metadata.groupId) throw new InternalServerError("Missing group ID in metadata");

    const group = await groupService.canAccessGroup(session.metadata.groupId, false, user);

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string, { expand: ["items.data.price.product"] });

    if (customerId && (!user.stripeCustomerId || user.stripeCustomerId !== session.customer)) {
      user.stripeCustomerId = customerId;
      await database.users.save(user);
    }

    const integrationPromises: Promise<Integration>[] = subscription.items.data
      // Filter out non-integration items (like the base group item)
      .filter(item => !!(item.price.product as Stripe.Product).metadata.type)
      .map(({ id, price }) => {
        const product = price.product as Stripe.Product;
        const type = product.metadata.type as IntegrationType;

        const integration = new Integration();
        integration.type = type;
        integration.config = integrationDefault[type];
        integration.group = group;
        integration.stripeItemId = id;

        return database.integrations.save(integration);
      });

    const integrations = await Promise.all(integrationPromises);

    group.stripeSubscriptionId = subscription.id;
    group.integrations = integrations;
    await database.groups.save(group);

    return { received: true };
  }
}