import { createContext } from "react";

import { FullUser } from "../api/types";

const UserContext = createContext<FullUser | null>(null);

export const UserProvider = UserContext.Provider;
export const UserConsumer = UserContext.Consumer;
export default UserContext;
