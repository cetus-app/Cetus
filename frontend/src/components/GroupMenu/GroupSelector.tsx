// Created by josh on 28/05/2020
import React, { FunctionComponent, useEffect, useState } from "react";
import {PartialGroup, UnlinkedGroup} from "../../api/types";
export enum GroupType {
  normal,
  unlinked
}
interface GroupSelectorProps {
  type: GroupType,
  handleSelected: Function
}




export const GroupSelector: FunctionComponent<GroupSelectorProps> = ({ groups, handleSelected }) => {
  return <div>

  {
    groups.map((g)=>)
  }

</div>};
export default GroupSelector;
