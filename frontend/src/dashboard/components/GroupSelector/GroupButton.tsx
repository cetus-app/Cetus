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
    <div role="button" onClick={() => handleClick()} onKeyPress={() => handleClick()} tabIndex={0} className="group-button has-text-centered has-text-weight-bold has-background-light">
      <div className="image">
        <img src={imgUrl} alt="Group icon" className="group-selector-img" />
      </div>

      <span className="group-selector-label">
        {!enabled ? <abbr title="Group not enabled" className="icon has-text-danger"><i className="fas fa-exclamation-triangle" /></abbr> : ""}
        { groupName }
      </span>

    </div>
  </div>
);
export default GroupButton;
