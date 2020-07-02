import { Bot } from "../../entities";
import { PartialGroup } from "../GroupController/types";

export class InternalGroup extends PartialGroup {
  bot: Bot
}
