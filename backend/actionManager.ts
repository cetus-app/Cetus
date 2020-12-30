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
// https://crontab.guru/#1_0_1_*_*
  schedule("1 0 1 * *", () => {
    run().catch(console.error);
  });

  async function run () {
    // todo: check it is right time
    const date = new Date();
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

      // todo: check for existing
      insertPromises.push(repo.insert(count));
    }

    // Handle errors without dying
    insertPromises.map(i => i.catch(e => console.error(e)));
    await insertPromises;
    log("All values inserted!");

    // Reset counts
    await database.groups
      .createQueryBuilder()
      .update(Group)
      .set({ actionCount: 0 })
      .execute();

    log("Counts reset. Done.");
  }
  setTimeout(run, 3000);
}
