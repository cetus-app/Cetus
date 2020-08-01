// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";


interface GroupButtonProps {
  imgUrl: string,
  groupName: string,
  enabled: boolean,
  handleClick: Function
}

const GroupButton: FunctionComponent<GroupButtonProps> = ({
  imgUrl, groupName, enabled, handleClick
}) => (
  <div className="column is-2 is-half-mobile is-offset-one-quarter-mobile">
    <div role="button" onClick={() => handleClick()} onKeyPress={() => handleClick()} tabIndex={0} className={`group-button has-text-centered has-text-weight-bold ${enabled ? "has-background-light" : "has-background-danger disabled"}`}>
      <div className="image">
        <img src={imgUrl} alt="Group icon" className="group-selector-img" />
      </div>
      <span className="group-selector-label">
        { groupName }
      </span>

    </div>
  </div>
);
export default GroupButton;
