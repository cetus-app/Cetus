// Involves primarily Roblox-facing requests
// Includes logic to demote offenders and revert malicious actions.

import Integration, { AntiAdminAbuseConfig } from "../../../backend/entities/Integration.entity";
import {
  ActionTypeRequest, AuditLog, AuditLogActor, ChangeRankAction
} from "../types";
import { getLogs, makeRequest } from "./util";

async function getRoleId (groupId: number, cookie: string, rankId: number) {
  const url = `https://groups.roblox.com/v1/groups/${groupId}/roles`;
  const res = await makeRequest(url, cookie);

  const parsed = await res.json();
  const { roles } = parsed;

  for (let counter = 0; counter < roles.length; counter++) {
    if (roles[counter].rank === rankId) {
      return roles[counter].id;
    }
  }
  throw new Error(`Rank ${rankId} does not exist in group ${groupId}`);
}

export async function demote (actor: AuditLogActor, integration: Integration) {
  const config = integration.config as AntiAdminAbuseConfig;
  // do not 'demote' up the way
  if (actor.rank <= config.demotionRank) return false;
  if (config.demotionRank === 0) return false;
  const { group: { bot } } = integration;
  if (!bot) throw new Error("No group bot - this shouldn't happen.");
  // Demote
  return setRank(integration, actor.id, config.demotionRank);
}

export async function setRank (integration: Integration, userId: number, rankId: number): Promise<boolean> {
  const { group: { bot, robloxId: groupId } } = integration;
  if (!bot) throw new Error("No group bot - this shouldn't happen.");
  // This shouldn't get hit either
  if (userId === bot.robloxId) {
    throw new Error("Cannot demote the bot user.");
  }
  // If its > 255 its a rolesetid.
  const roleId = rankId > 255 ? rankId : await getRoleId(groupId, bot.cookie, rankId);

  const csrfUrl = "https://api.roblox.com/sign-out/v1";
  const csrfRes = await makeRequest(csrfUrl, bot.cookie, { method: "POST" });

  const CSRF = csrfRes.headers.get("x-csrf-token");
  if (!CSRF) {
    throw new Error(`Failed to rank ${userId} to ${rankId} - Did not receive X-CSRF-TOKEN`);
  }

  const url = `https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`;
  const headers = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "X-CSRF-TOKEN": CSRF,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Type": "application/json"
  };
  const body = JSON.stringify({ roleId });
  const res = await makeRequest(url, bot.cookie, {
    method: "PATCH",
    headers,
    body
  });

  if (res.ok) {
    // For our records: We shouldn't rank people that often and it's important to know when we do.
    console.log(`Ranked ${userId} in Group ${groupId} to ${rankId}`);
    return true;
  }
  // Nope.
  const parsed = await res.json();
  if (parsed.errors[0].message) {
    console.error(`Error: ${parsed.errors[0].message}`);
    throw new Error(`Failed to rank ${userId}: ${parsed.errors[0].message}`);
  } else {
    throw new Error(`${res.status}: Failed to rank ${userId} to ${rankId} in ${groupId}`);
  }
}

export async function revert (actor: AuditLogActor, integration: Integration): Promise<number> {
  if (!integration.group.bot) throw new Error("No bot!");

  // We can revert a max of 100 change ranks. At a later date, I could add cursor/page support.
  // The likelihood of someone managing to do 100 before we detect it is pretty small.
  // We'll also only revert change ranks done within the last 2 hours.
  const logs = await getLogs(integration.group.robloxId, integration.group.bot.cookie, {
    userId: actor.id,
    limit: 100,
    actionType: ActionTypeRequest.changeRank
  });
  const earliest = Date.now() - 7200000;
  const revertable = logs.logs.filter((log: AuditLog) => log.created.getTime() > earliest);
  // Attempt to revert
  const promises = [];
  for (const toUndo of revertable) {
    // We know this will be the case
    if (toUndo.actor.id === actor.id) {
      const {
        oldRoleSetId, targetId, oldRoleSetName, targetName
      } = toUndo.action as ChangeRankAction;

      promises.push((setRank(integration, targetId, oldRoleSetId)));
      console.log(`Attempted to rank ${targetId} (${targetName}) to ${oldRoleSetId} (${oldRoleSetName})`);
    }
  }
  promises.map(p => p.catch(e => e));
  const resp = await Promise.all(promises);
  let successful = 0;
  for (let counter = 0; counter < resp.length; counter++) {
    if (resp[counter] === true) {
      successful++;
    }
  }
  return successful;
}
