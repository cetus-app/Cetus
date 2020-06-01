// The currently "selected" Group
import { createContext } from "react";

import { PartialGroup } from "../api/types";

const GroupContext = createContext<PartialGroup | null>(null);

export const GroupProvider = GroupContext.Provider;
export const GroupConsumer = GroupContext.Consumer;
export default GroupContext;
