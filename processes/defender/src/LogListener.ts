import fetch from "node-fetch";

import { Bot } from "../../../backend/entities";
import { AuditLog, GetLogsOptions, LogsResponse } from "../types";
import { camelify, getLogs, parseLog } from "./util";

class LogListener {
  private readonly groupId: number;

  // Interval, in seconds.
  private bot: Bot

  private last: string | undefined

  constructor (groupId:number, bot: Bot) {
    this.groupId = groupId;
    this.bot = bot;
  }

  public async init () {
    // This is the first run.
    const logs = await this.getLogs({ limit: 10 });
    this.last = logs.logs[0].rawCreated;
    return false;
  }

  public async fetch (): Promise<AuditLog[]> {
    if (!this.last) {
      throw new Error("Tried to fetch before init complete");
    }
    const last = `${this.last}`;
    let found = false;
    let cursor = "";
    const output = [];
    while (!found) {
      // eslint-disable-next-line no-await-in-loop
      const logs = await this.getLogs({
        limit: 50,
        cursor: cursor !== "" ? cursor : undefined
      });
      for (const log of logs.logs) {
        if (log.rawCreated > last) {
          output.push(log);
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
          cursor = logs.next;
        }
        // Not found and no pages. What?
        throw new Error(`Failed to locate last log and no more pages are available.`);
      }
    }
    return output;
  }

  // Moved to util so it can be used outside this class
  public getLogs (opt?: GetLogsOptions): Promise<LogsResponse> {
    return getLogs(this.groupId, this.bot.cookie, opt);
  }
}
export default LogListener;
