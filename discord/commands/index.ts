import CetusCommand from "./CetusCommand";
import PingCommand from "./PingCommand";
import groupCommands from "./group";

export { CetusCommand, PingCommand };

export default [PingCommand, ...groupCommands];
