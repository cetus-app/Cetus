// Involves primarily Roblox-facing requests
// Includes logic to demote offenders and revert malicious actions.

import Integration, { AntiAdminAbuseConfig } from "../../../backend/entities/Integration.entity";
import { AuditLogActor } from "../types";
import { makeRequest } from "./util";

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
  const { group: { bot, robloxId: groupId } } = integration;
  if (!bot) throw new Error("No group bot - this shouldn't happen.");
  // Get role id
  const roleId = await getRoleId(groupId, bot.cookie, config.demotionRank);
  // Demote
  return setRank(integration, actor.id, roleId);
}

export async function setRank (integration: Integration, userId: number, rankId: number): Promise<boolean> {
  const { group: { bot, robloxId: groupId } } = integration;
  if (!bot) throw new Error("No group bot - this shouldn't happen.");
  // This shouldn't get hit either
  if (userId === bot.robloxId) {
    throw new Error("Cannot demote the bot user.");
  }
  const roleId = await getRoleId(groupId, bot.cookie, rankId);

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

export async function revert(_actor: AuditLogActor, _integration: Integration): Promise<number> {
  // TODO: Implement
  return 0;
}
