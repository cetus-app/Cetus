import fetch from "node-fetch";

import {
  Activation,
  NotifcationType,
  NotificationBody,
  WebhookError
} from "../../../backend/controllers/InternalController/types";
import Integration, { AntiAdminAbuseConfig } from "../../../backend/entities/Integration.entity";
import sendWebhook from "./webhook";

const { url, token } = process.env;

const sent = new Set();
export async function notify (integration: Integration, notifcationType: NotifcationType.scanError, data?: never): Promise<void>
export async function notify (integration: Integration, notifcationType: NotifcationType.activation, data: Activation): Promise<void>
export async function notify (integration: Integration, notifcationType: NotifcationType.webhookError, data: WebhookError): Promise<void>
export async function notify (integration: Integration, notifcationType: NotifcationType, data: any): Promise<void> {
  // Try webhook. Does not send for webhook failure, obviously.
  const sentKey = `${integration.id}-${notifcationType}`;
  // We only halt for non-activations (e.g already sent errors)
  if (sent.has(sentKey) && notifcationType !== NotifcationType.activation) return;
  const config = integration.config as AntiAdminAbuseConfig;
  if (config.webhook) {
    const configUrl = `https://cetus.app/dashboard/groups/${integration.group.id}/integrations/${integration.id}`;
    try {
      if (notifcationType === NotifcationType.scanError) {
        await sendWebhook(config.webhook, {
          username: "Cetus Group Defender",
          // eslint-disable-next-line @typescript-eslint/naming-convention
          avatar_url: "https://i.imgur.com/mWKgCd4.png",
          content: "Your Group is vulnerable! See embed for more information.",
          embeds: [
            {
              title: `Failed to run: Insufficient permissions`,
              description: `Our systems have attempted to scan our Audit logs for evidence of admin abuse, but were unable to due to a permission error. \nPlease re-rank the bot as soon as possible\nUser id: ${integration.group.bot && integration.group.bot.robloxId} \nGroup id: ${integration.group.robloxId}`,
              fields: [
                {
                  name: "Confused or need help?",
                  value: `Head to the Integration panel [here](${configUrl}) to configure this integration.\nYou can find the support links on [our website](https://cetus.app)`
                }
              ],
              color: 16763904,
              url: configUrl,
              footer: { text: "Powered by Cetus Group Defender" }
            }
          ]
        });
      } else if (notifcationType === NotifcationType.activation) {
        const {
          userId, username, reverted, demoted
        } = data as Activation;
        await sendWebhook(config.webhook, {
          username: "Cetus Group Defender",
          // eslint-disable-next-line @typescript-eslint/naming-convention
          avatar_url: "https://i.imgur.com/hoPA0ZZ.png",
          content: "@here Warning: Possible admin abuse detected.",
          embeds: [
            {
              title: `A user has exceeded your action thresholds`,
              thumbnail: { url: `https://verify.nezto.re/api/roblox/${userId}/image` },
              description: `**Username**: ${username}\n**User id**:${userId}\n**Attacker demoted**: ${demoted ? "Yes" : "No"}\n:warning:\`${reverted}\` actions were reverted.`,
              fields: [
                {
                  name: "Note on abuse reversion",
                  value: `At present our systems are only able to revert admin abuse in the form of mass ranking users. We'll do our best to fix your group as much as possible, but cannot guarantee it will be returned to it's previous state - and we take no responsibility for any damage incurred.`
                },
                {
                  name: "What now?",
                  value: `We suggest you now check your group and go through it's Audit logs and try to ascertain whether or not this is a legitimate attack. If it is a false activation, feel free to re-rank the user in question.`
                },
                {
                  name: "Your current settings",
                  value: `Your current configuration is to activate if ${config.actionCount} actions are performed within ${config.actionTime} minutes by a user. [Update this here](${configUrl})`
                }
              ],
              color: 11730954,
              url: configUrl,
              footer: { text: "Powered by Cetus Group Defender" }
            }
          ]
        });
      }
    } catch (e) {
      // Report webhook failure
      await sendMesage(integration, NotifcationType.webhookError, {
        message: e.message,
        status: e.status || 500
      });
    }
  }

  // Send email
  await sendMesage(integration, notifcationType, data);
  if (notifcationType !== NotifcationType.activation) {
    sent.add(sentKey);
  }
}

async function sendMesage (integration: Integration, notifcationType: NotifcationType, data?: WebhookError|Activation) {
  if (!token) throw new Error("No token set!");
  const body:NotificationBody = {
    type: notifcationType,
    groupId: integration.group.id,
    data: data || undefined
  };
  await fetch(`${url}/internal/defender-notify`, {
    method: "POST",
    headers: {
      authorization: token,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
}
