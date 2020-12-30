/*
    Action manager
    This file is responsible for resetting the actionCount on groups at the end of each month.
    It also stores these values for analytics.
 */
import { schedule } from "node-cron";
import { getRepository } from "typeorm";

import database from "./database";
import { ActionCount, Group } from "./entities";

const log = (...args: any[]) => console.log("ActionManager: ", ...args);
export default function init () {
  // Run on the first day of the month at 00:01.
// https://crontab.guru/#1_0_1_*_*
  schedule("1 0 1 * *", () => {
    run().catch(console.error);
  });

  async function run () {
    const date = new Date();

    if (date.getDate() !== 1) {
      return log("Stopped: It is not the first day of the month!");
    }

    log("New month: Resetting action counts and storing values.");
    const repo = await getRepository(ActionCount);

    // Get all group id, robloxId and actionCount
    const values = await database.groups.find({ select: ["actionCount", "id", "robloxId"] });

    // Insert them into analytics table
    const insertPromises = [];
    for (const grp of values) {
      const count = new ActionCount();
      const year = date.getFullYear();
      const month = date.getMonth();

      count.actionId = `${grp.robloxId}${year}${month}`;
      count.id = grp.id;
      count.count = grp.actionCount;
      count.robloxId = grp.robloxId;
      count.year = year;
      count.month = month;

      insertPromises.push(repo.save(count));
    }

    // Handle errors without dying
    insertPromises.map(i => i.catch(e => console.error(e)));
    await Promise.all(insertPromises);
    log("All values inserted!");

    // Reset counts
    await database.groups
      .createQueryBuilder()
      .update(Group)
      .set({ actionCount: 0 })
      .execute();

    return log("Counts reset. Done.");
  }
}
