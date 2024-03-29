import { Request } from "express";
import fetch from "node-fetch";
import { ForbiddenError, NotFoundError } from "routing-controllers";

import Roblox from "../api/roblox/Roblox";
import { FullGroup } from "../controllers/GroupController/types";
import database from "../database";
import { Group } from "../entities";
import User from "../entities/User.entity";


export default class GroupService {
  constructor (private request: Request) {
  }


  // Returns either the group or throws an error if the user does not have access
  // Can also have a group passed if we've already fetched it and want to check if they have access
  async canAccessGroup (group: Group["id"]|Group, user?: User, includeShared?: boolean): Promise<Group> {
    const usr = this.request.user || user;
    const grp = typeof group !== "string" ? group : await database.groups.getFullGroup(group);
    if (!grp) {
      throw new NotFoundError("Group not found");
    }

    if (!usr) {
      throw new Error("Cannot validate access: No user.");
    }

    // Check permissions
    if (grp.owner.id === usr.id) {
      return grp;
    }
    if (includeShared && grp.admins.find(admin => admin.id === usr.id)) {
      return grp;
    }
    throw new ForbiddenError("You do not have access to that group.");
  }

  // Adds the admin robloxInfo to the passed group, and returns the new one.
  async addAdminInfo (group: Group): Promise<FullGroup> {
    const toReturn: FullGroup = { ...group };
    const adminImagePromises = [];
    const adminUsernamePromises = [];
    if (group && group.admins) {
      for (const admin of group.admins) {
        if (admin.robloxId) {
          const usernamePromise = Roblox.getUsernameFromId(admin.robloxId);
          const imagePromise = Roblox.getUserImage(admin.robloxId);
          adminImagePromises.push(imagePromise);
          adminUsernamePromises.push(usernamePromise);
          usernamePromise.catch(e => e);
          imagePromise.catch(e => e);
        }
      }
    }
    const adminPromises = Promise.all([Promise.all(adminImagePromises), Promise.all(adminUsernamePromises)]);
    const [adminImages, adminUsernames] = await adminPromises;

    for (let i = 0; i < adminImages.length; i++) {
      const imageUrl = adminImages[i];
      toReturn.admins[i].robloxInfo = {
        // Id cannot be undefined.
        id: group.admins[i].robloxId,
        username: adminUsernames[i],
        image: imageUrl || ""
      };
    }
    return toReturn;
  }

  async notifyDeploy (group: Group): Promise<void> {
    const { alertWebhook } = process.env;
    if (!alertWebhook) {
      console.error(`Failed to send alert: No alertWebhook!`);
      return undefined;
    }
    try {
      const body: any = {
        content: "New group added (Please deploy bot!)",
        embeds: [
          {
            title: "New Group added",
            description: `ID: \`${group.robloxId}\`\nInternal: ${group.id}`,
            url: `https://www.roblox.com/groups/${group.robloxId}/-`,
            fields: [],
            color: 16689675
          }
        ]
      };
      if (group.bot) {
        const botName = await Roblox.getUsernameFromId(group.bot.robloxId);
        body.embeds[0].fields.push({
          name: "Bot info",
          value: `${botName || "Unknown"}(${group.bot.robloxId})\n[Profile link](https://roblox.com/users/${group.bot.robloxId}/profile)
Internal: ${group.bot.id}, IsDead: ${group.bot.dead}`
        });
      } else {
        body.embeds[0].fields.push({
          name: "No bot deployed",
          value: `This group does not have a bot assigned.`
        });
      }
      body.embeds[0].fields.push({
        name: "Env",
        value: process.env.NODE_ENV || "Not set"
      });
      await fetch(alertWebhook, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        method: "POST"
      });
    } catch (e) {
      console.error("AlertWebhookFail", e.message);
    }
    return undefined;
  }
}
