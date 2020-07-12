// Manages the queue etc. and fetches the "Scannable" Groups from main backend.
// Using a listener class feels a bit inefficient, and this could probably be optimised (with the various "in-use" detections)
// Works for now!
import { NotifcationType } from "../../backend/controllers/InternalController/types";
import Integration, { AntiAdminAbuseConfig } from "../../backend/entities/Integration.entity";
import LogListener from "./src/LogListener";
import { notify } from "./src/notify";
import { demote, revert } from "./src/takeAction";
import { getScannable } from "./src/util";
import { AuditLog, AuditLogActor } from "./types";


const { url, token, scanInterval = "300000" } = process.env;
if (!url || !token || !scanInterval) {
  console.error(`Cannot start: Missing URL or Auth env variable!`);
  process.exit(1);
}

// Globals
export const listeners = new Map();
const interval = parseInt(scanInterval, 10);

// Integration is a reference so it isn't too expensive
interface UserTotal {
  num: number,
  since: number,
  integration: Integration,
  actor: AuditLogActor
}
const totals = new Map<string, UserTotal>();

console.log(`Starting Group Defender`);
doFetch();
setInterval(doFetch, interval);

// Queue
async function doFetch () {
  const toScan = await getScannable();
  if (toScan.length !== 0) {
    // Milliseconds
    const timePer = Math.floor((interval / toScan.length) - 10);
    let counter = 0;
    const int = setInterval(() => {
      check(toScan[counter]);
      counter++;
      if (counter >= toScan.length) {
        // Done
        clearInterval(int);
        // Iterate all scannable and Remove those not listed
        for (const [key] of listeners) {
          if (!toScan.find(val => val.id === key)) {
            listeners.delete(key);
            console.log(`Removed ${key}`);
          }
        }
      }
    }, timePer);
  }
}

// Is responsible for scanning integrations and registering log listeners as required
async function check (integration: Integration) {
  console.log(`Scanning ${integration.id}`);
  try {
    if (listeners.has(integration.id)) {
      const listener: LogListener = listeners.get(integration.id);
      const logs = await listener.fetch();

      // Total
      const promises:Promise<any>[] = [];
      promises.map(p => p.catch(e => e));
      for (const log of logs) {
        promises.push(handleLog(integration, log));
      }
      await Promise.all(promises);
      await checkTotals();
    } else if (!integration.group.bot) {
      console.error(`Failed to setup Integration ${integration.id}: No bot!`);
    } else {
      // Create new Listener
      const listener = new LogListener(integration.group.robloxId, integration.group.bot);
      await listener.init();
      listeners.set(integration.id, listener);
    }
  } catch (e) {
    if (e.message === "Insufficient permissions to complete the request.") {
      listeners.delete(integration.id);
      await notify(integration, NotifcationType.scanError);
    } else {
      throw new Error(e);
    }
  }
}

async function checkTotals () {
  for (const [key, userTotal] of totals) {
    const config = userTotal.integration.config as AntiAdminAbuseConfig;
    const { actor, integration } = userTotal;
    if (userTotal.num > config.actionCount) {
      // Should prevent re-activations for actions just after this. Bit hacky but it should work
      totals.delete(key);
      let demoted;
      try {
        // eslint-disable-next-line no-await-in-loop
        demoted = await demote(actor, integration);
      } catch (e) {
        demoted = false;
        console.log(`Failed to demote `, e);
      }

      let reverted: number = 0;
      try {
        // eslint-disable-next-line no-await-in-loop
        reverted = await revert(actor, integration);
      } catch (e) {
        reverted = 0;
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await notify(integration, NotifcationType.activation, {
          userId: actor.id,
          username: actor.username,
          rank: actor.rankName,
          reverted,
          demoted
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
}

async function handleLog (integration: Integration, log: AuditLog): Promise<any> {
  if (integration.group.bot && log.actor.id === integration.group.bot.robloxId) {
    // we do not act on bot actions
    return false;
  }
  const config = integration.config as AntiAdminAbuseConfig;
  console.log(`${integration.id}: ${log.actor.username} - ${log.type}`);
  const key = `${integration.id}-${log.actor.id}`;
  const userTotal = totals.get(key);
  if (userTotal) {
    // Check if it's expired
    if (((Date.now() - userTotal.since)) > config.actionTime * 60000) {
      totals.set(key, {
        num: 1,
        since: Date.now(),
        integration,
        actor: log.actor
      });
      console.log("Reset expired");
    } else {
      // Preserves since and just makes sure there isn't any other issues (Clones the object)
      const newTotal = { ...userTotal };
      newTotal.num += 1;

      console.log(`New total: ${newTotal.num}`);
      totals.set(key, newTotal);
    }
  } else {
    console.log("None found!");
    totals.set(key, {
      num: 1,
      since: Date.now(),
      integration,
      actor: log.actor
    });
  }
  return false;
}
