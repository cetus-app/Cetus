import BindsCommand from "./Binds";
import ConfigurationCommand from "./Configuration";
import GetRolesCommand from "./GetRoles";
import NicknameCommand from "./Nickname";
import ManagementCommands from "./management";

export {
  BindsCommand, ConfigurationCommand, GetRolesCommand, NicknameCommand
};

export default [BindsCommand, ConfigurationCommand, GetRolesCommand, NicknameCommand, ...ManagementCommands];
