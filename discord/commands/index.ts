import CetusCommand from "./CetusCommand";
import PingCommand from "./PingCommand";
import SetPrefixCommand from "./SetPrefixCommand";
import groupCommands from "./group";

export { CetusCommand, PingCommand, SetPrefixCommand };

export default [PingCommand, SetPrefixCommand, ...groupCommands];
