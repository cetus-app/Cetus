/* eslint-disable @typescript-eslint/naming-convention */
import bodyParser from "body-parser";
import { Request } from "express";
import {
  BadRequestError, Body, CurrentUser, ForbiddenError, HeaderParam, InternalServerError, JsonController, Post, Req, UseBefore
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import Stripe from "stripe";

import Roblox from "../../api/roblox/Roblox";
import { stripeGroupPriceId } from "../../constants";
import database from "../../database";
import { Integration, User } from "../../entities";
import { Subscription } from "../../entities/Group.entity";
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
    if (group.subscription) throw new BadRequestError("Group already has a subscription");

    const { name } = await Roblox.getGroup(group.robloxId) || {};

    const integrationItems: Stripe.Checkout.SessionCreateParams.LineItem[] = integrations.map(integration => ({
      quantity: 1,
      price: integrationMeta[integration].stripePriceId
    }));

    const { id } = await stripe.checkout.sessions.create({
      customer_email: user.email,
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

    const user = await database.users.findOne({ where: { email: session.customer_email } });

    if (!user) throw new BadRequestError("User not found");
    if (!user.emailVerified) throw new BadRequestError("Email not verified");

    if (!session.metadata || !session.metadata.groupId) throw new InternalServerError("Missing group ID in metadata");

    const group = await groupService.canAccessGroup(session.metadata.groupId, false, user);

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string, { expand: ["items.data.price.product"] });

    const integrationPromises: Promise<Integration>[] = subscription.items.data
      // Filter out non-integration items (like the base group item)
      .filter(item => !!(item.price.product as Stripe.Product).metadata.type)
      .map(item => {
        const product = item.price.product as Stripe.Product;
        const typeStr = product.metadata.type as keyof typeof IntegrationType;
        const type = IntegrationType[typeStr];

        const integration = new Integration();
        integration.type = type;
        integration.config = integrationDefault[type];
        integration.group = group;

        return database.integrations.save(integration);
      });

    const integrations = await Promise.all(integrationPromises);

    group.subscription = Subscription.basic;
    group.integrations = integrations;
    await database.groups.save(group);

    return { received: true };
  }
}
