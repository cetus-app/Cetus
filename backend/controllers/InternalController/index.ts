import { Request } from "express";
import {
  BadRequestError,
  Body,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Post,
  Req,
  UseBefore
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../../api/roblox/Roblox";
import { EmailGroup } from "../../constants";
import database from "../../database";
import Integration, { AntiAdminAbuseConfig, IntegrationType } from "../../entities/Integration.entity";
import safeCompare from "../../shared/util/safeCompare";
import { ButtonEmailContent } from "../../types";
import {
  Activation, InternalGroup, NotifcationType, NotificationBody, WebhookError
} from "./types";


const { frontendUrl } = process.env;

export function internalAuth (request: Request, _response: any, next?: (err?: any) => any): any {
  const token = request.get("authorization");
  if (!process.env.internalKey || !token || !safeCompare(token, process.env.internalKey)) {
    throw new NotFoundError("Resource not found.");
  }
  return next ? next() : "";
}

@UseBefore(internalAuth)
@JsonController("/internal")
export default class Internal {
  // Group defender
  @Get("/scannable")
  @ResponseSchema(InternalGroup, { isArray: true })
  async getScannable (): Promise<Integration[]> {
    // Based on https://kscerbiakas.lt/typeorm-nested-relationships/
    const dbRes = await database.integrations.createQueryBuilder("integration")
      .leftJoinAndSelect("integration.group", "group")
      .leftJoinAndSelect("group.bot", "bot")
      .addSelect("bot.cookie")
      .where("integration.type = :type", { type: IntegrationType.antiAdminAbuse })
      .andWhere("bot.dead = :no", { no: false })
      .andWhere("group.botActive = :yes", { yes: true })
      .getMany();
    // Checks for config.enabled as DB can't really interact with JSON fields
    return dbRes.filter(i => {
      const config = i.config as AntiAdminAbuseConfig;
      return config.enabled;
    });
  }

  // Takes notifications from Group Defender and emails the user appropriately.
  @Post("/defender-notify")
  @OnUndefined(204)
  async sendNotification (@Req() request: Request, @Body() { type, data, groupId }: NotificationBody): Promise<any> {
    const group = await database.groups.getFullGroup(groupId);
    if (!group) {
      throw new BadRequestError("Group not found.");
    }
    const integration = group.integrations.find(i => i.type === IntegrationType.antiAdminAbuse);
    if (!integration) return;

    // Defaults. Mostly overridden
    const toSend:ButtonEmailContent = {
      buttonUrl: `${frontendUrl}/dashboard/${group.id}/integrations`,
      buttonText: "View settings",
      subject: "Group defender notification",
      text: "No text",
      title: "Group defender"
    };
    if (type === NotifcationType.webhookError) {
      const { status, message } = data as WebhookError;
      const { webhook } = integration.config as AntiAdminAbuseConfig;
      toSend.subject = `Group defender error`;
      toSend.title = `Group defender: Failed to fire webhook`;
      toSend.text = `We attempted to fire your webhook but were unable to do so due to an error.<br>Error status code: ${status}<br>Message: ${message}<br>Url: ${webhook}`;
    } else if (type === NotifcationType.activation) {
      const { userId, demoted, reverted } = data as Activation;
      toSend.text = "Group defender has detected possible admin abuse. You can see details below.<br>";
      try {
        const robloxInfo = await Roblox.getUserInfo(userId);
        if (robloxInfo) {
          toSend.text += `Username of attacker: ${robloxInfo.name}<br>User id: <code>${robloxInfo.id}</code>`;
        } else {
          // Just to trigger the catch
          toSend.text += `Attacker's user id: ${userId}`;
        }
      } catch (e) {
        toSend.text += `Attacker's user id: ${userId}`;
      }
      toSend.text += `<br>This user was <strong>${demoted ? "Demoted" : "not demoted"}</strong> and ${reverted} actions were reverted.`;
      toSend.subject = "Alert: Group Defense activation";
      toSend.title = `Group defender has detected admin abuse`;
      toSend.buttonText = "Check your Group";
      toSend.buttonUrl = `https://www.roblox.com/groups/${group.robloxId}/-`;
    } else if (type === NotifcationType.scanError) {
      // Set Group.botActive to false.
      group.botActive = false;
      await database.groups.save(group);
      if (!group.bot || !group.bot.robloxId) {
        throw new Error("No bot or no bot id - what?");
      }
      const botInfo = await Roblox.getUserInfo(group.bot.robloxId);
      toSend.title = "Group defender: Scan failed";
      toSend.subject = "Group defender: Permissions needed";
      toSend.text = `Failed to scan group: Please ensure the bot is ranked in your group.<br><strong>Bot name</strong>: <a href="https://roblox.com/users/${group.bot.robloxId}/profile">${botInfo ? botInfo.name : group.bot.robloxId}</a><br><strong>Id</strong>: ${group.bot.robloxId}<br>The bot must be ranked and have permission to view audit logs for your group.<br><h3 style="text-align: center">How do I know this is genuine?</h3><p>All Cetus bots are ranked in our Group. <a href="https://roblox.com/users/${group.bot.robloxId}/profile">View the bot's profile</a> and verify that it is in our Roblox group and is ranked Staff.</p>`;
      toSend.buttonText = "Configure Group";
      toSend.buttonUrl = `https://www.roblox.com/groups/${group.robloxId}/-`;
    } else {
      throw new BadRequestError("Unrecognised type enum.");
    }
    await request.userService.sendEmail(EmailGroup.general, toSend, group.owner);
  }
}
