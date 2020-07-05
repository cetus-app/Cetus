// Manages the queue etc. and fetches the "Scannable" Groups from main backend.
// Using a listener class feels a bit inefficient, and this could probably be optimised (with the various "in-use" detections)
// Works for now!
import { NotifcationType } from "../../backend/controllers/InternalController/types";
import Integration, { AntiAdminAbuseConfig } from "../../backend/entities/Integration.entity";
import LogListener from "./src/LogListener";
import { notify } from "./src/notify";
import { demote, revert } from "./src/takeAction";
import { getScannable } from "./src/util";
import { AuditLog } from "./types";

const { url, token, scanInterval = "300000" } = process.env;
if (!url || !token || !scanInterval) {
  console.error(`Cannot start: Missing URL or Auth env variable!`);
  process.exit(1);
}

// Globals
const listeners = new Map();
const interval = parseInt(scanInterval, 10);
interface UserTotal {
  num: number,
  since: number
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
      await listener.fetch();
    } else if (!integration.group.bot) {
      console.error(`Failed to setup Integration ${integration.id}: No bot!`);
    } else {
      // Create new Listener
      const listener = new LogListener(integration.group.robloxId, integration.group.bot, (log: AuditLog) => handleLog(integration, log));
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

// Handles the actual totalling.
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
    if ((Date.now() - userTotal.since) > config.actionTime) {
      totals.set(key, {
        num: 1,
        since: Date.now()
      });
    } else {
      // Preserves since and just makes sure there isn't any other issues (Clones the object)
      const newTotal = { ...userTotal };
      newTotal.num += 1;
      // We've already checked it's not expired - take action!
      if (newTotal.num > config.actionCount) {
        // TODO: Notify
        let demoted;
        try {
          demoted = await demote(log.actor, integration);
        } catch (e) {
          demoted = false;
        }

        let reverted: number = 0;
        try {
          reverted = await revert(log.actor, integration);
        } catch (e) {
          reverted = 0;
        }
        try {
          await notify(integration, NotifcationType.activation, {
            userId: log.actor.id,
            username: log.actor.username,
            rank: log.actor.rankName,
            reverted,
            demoted
          });
        } catch (e) {
          console.error(e);
        }
        // Should prevent re-activations for actions just after this. Bit hacky but it should work
        totals.set(key, {
          num: -5,
          since: Date.now()
        });
      }
      totals.set(key, newTotal);
    }
  } else {
    totals.set(key, {
      num: 1,
      since: Date.now()
    });
  }
  return false;
}
