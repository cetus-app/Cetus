/**
 * Rate limit middleware
 * This middleware is used for the RobloxController only. It provides rate limiting based upon the group,
 * for free groups.
 */
import { NextFunction, Request, Response } from "express";

import { FREE_REQUESTS } from "../constants";
import database from "../database";
import { getGroupFromRequest } from "../decorators/CurrentGroup";
import { TooManyRequestsError } from "../shared";

// Handles rate limiting for state-changing actions.
export default async function rateLimitMiddleware (req: Request, _res: Response, next: NextFunction) {
  const protectedMethods = ["post", "patch", "put", "delete"];

  if (!protectedMethods.includes(req.method.toLowerCase())) {
    // it isn't a protected method
    return next();
  }
  // Get Group
  const grp = await getGroupFromRequest(req);
  // Increment count
  const newCount = grp.actionCount + 1;
  await database.groups.update({ id: grp.id }, { actionCount: newCount });

  if (newCount >= FREE_REQUESTS) {
    // They have exceeded their quota.
    // Send notification (if not already sent)
    throw new TooManyRequestsError("You have exceeded your free quota this month. Please upgrade or wait until next month.");
  }
  return next();
}
