// The currently "selected" Group
import { createContext } from "react";

import { FullGroup } from "../api/types";

// It shouldn't be possible for this to be called
function defaultSetter () {
  throw new Error("Failed to set group context; No context setter provided.");
}

const GroupContext = createContext<[FullGroup | null, Function]>([null, defaultSetter]);

export const GroupProvider = GroupContext.Provider;
export const GroupConsumer = GroupContext.Consumer;
export default GroupContext;
