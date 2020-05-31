// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";

import { PartialGroup, UnlinkedGroup } from "../../api/types";

interface GroupButtonProps {
  imgUrl: string,
  groupName: string,
  handleClick: Function
}

export const GroupButton: FunctionComponent<GroupButtonProps> = ({ imgUrl, groupName, handleClick }) => (
  <div role="button" onClick={() => handleClick()} onKeyPress={() => handleClick()} tabIndex={0} className="group-button">
    <div className="image">
      <img src={imgUrl} alt="Group icon" />
    </div>
    { groupName }
  </div>
);
export default GroupButton;
