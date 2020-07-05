import fetch from "node-fetch";

import { Bot } from "../../../backend/entities";
import { AuditLog, GetLogsOptions, LogsResponse } from "../types";
import { camelify } from "./util";

class LogListener {
  private readonly groupId: number;

  // Interval, in seconds.
  private bot: Bot

  private last: string | undefined

  private readonly emit: Function

  constructor (groupId:number, bot: Bot, callback: (log: AuditLog)=> any) {
    this.groupId = groupId;
    this.bot = bot;
    this.emit = callback;
  }

  public async init () {
    // This is the first run.
    const logs = await this.getLogs({ limit: 10 });
    this.last = logs.logs[0].rawCreated;
    return false;
  }

  public async fetch () {
    if (!this.last) {
      throw new Error("Tried to fetch before init complete");
    }
    // We copy this.last as this.last is modified during batching, but the "earliest" we pass is not.
    await this.getPage({ limit: 50 }, `${this.last}`);
    return false;
  }

  private async getPage (opt: GetLogsOptions, earliest: string): Promise<any> {
    const logs = await this.getLogs(opt);
    // Only runs on the "first" page.
    if (!this.last) {
      throw new Error("Last isn't set!");
    } else {
      let found = false;
      for (const log of logs.logs) {
        if (log.rawCreated > earliest) {
          this.emit(log);
          if (log.rawCreated > this.last) {
            this.last = log.rawCreated;
          }
        } else {
          // We're past.
          found = true;
          break;
        }
      }
      if (!found) {
        if (logs.next) {
          const newOpt = { ...opt };
          newOpt.cursor = logs.next;
          return this.getPage(newOpt, earliest);
        }
        // Not found and no pages. What?
        throw new Error(`Failed to locate last log and no more pages are available.`);
      }
    }

    return false;
  }

  public async getLogs (opt?: GetLogsOptions): Promise<LogsResponse> {
    const url = new URL(`https://groups.roblox.com/v1/groups/${this.groupId}/audit-log`);
    if (opt) {
      for (const key of Object.keys(opt)) {
        // @ts-ignore
        url.searchParams.append(key, opt[key]);
      }
    }
    const res = await fetch(url, { headers: { cookie: `.ROBLOSECURITY=${this.bot.cookie}` } });
    const resp = await res.json();
    if (resp.errors) {
      throw new Error(resp.errors[0].message);
    } else {
      const out: (AuditLog[]) = [];
      for (const log of resp.data) {
        const {
          actor: { user: { userId, username }, role: { name: rankName, rank } },
          created,
          actionType,
          description

        } = log;
        out.push({
          actor: {
            id: userId,
            username,
            rank,
            rankName
          },
          created: new Date(created),
          type: actionType,
          action: camelify(description),
          rawCreated: created.split(".")[0]
        });
      }
      out.sort((f, s) => s.created.getTime() - f.created.getTime());
      return {
        next: resp.nextPageCursor,
        prev: resp.prevPageCursor,
        logs: out
      };
    }
  }
}
export default LogListener;
