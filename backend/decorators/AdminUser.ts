import { createParamDecorator, ForbiddenError, UnauthorizedError } from "routing-controllers";

import User, { PermissionLevel } from "../entities/User.entity";
import { Action } from "../types";

// Would prefer this as a middleware (e. g. `IsAdmin`) but cannot manage to set them up
// eslint-disable-next-line @typescript-eslint/naming-convention
const AdminUser = () => createParamDecorator({
  // Doesn't throw when `value` returns `undefined` for some reason (thus throwing errors manually)
  required: true,
  value: ({ request: { user } }: Action): User => {
    if (!user) throw new UnauthorizedError();
    if (user.permissionLevel !== PermissionLevel.admin) throw new ForbiddenError();

    return user;
  }
});

export default AdminUser;
