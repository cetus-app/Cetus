// This handles the rendering of a collection of groups. It fires the given event with the group ID.
// It is used to both render "Linked groups" and "unlinked groups"
import React, { FunctionComponent } from "react";
import "./GroupMenu.css";

interface GroupMenuProps {
  type: GroupMenuType,
  groupSelected: Function
}

export const GroupMenu: FunctionComponent<GroupMenuProps> = _props => <div />;
export default GroupMenu;
/*
  Each should pass:
  > name
  > Icon URL
  > CLick function
 */
