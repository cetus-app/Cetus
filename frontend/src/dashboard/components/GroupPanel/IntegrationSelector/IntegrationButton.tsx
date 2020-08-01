import React, { FunctionComponent } from "react";

import { IntegrationInfo } from "../../../api/types";

interface IntegrationButtonProps {
  meta: IntegrationInfo,
  handleClick: Function,
  handleDisable?: Function,
  inactive?: boolean
}

const IntegrationButton: FunctionComponent<IntegrationButtonProps> = ({
  meta, handleClick, handleDisable, inactive
}) => {
  const {
    name = "Unnamed",
    shortDesc = "No description provided.",
    icon = "fas fa-rocket"
  } = meta || {};

  // Event will propagate to box div's `onClick` by default
  const handleDisableStopProp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!handleDisable) return;

    e.stopPropagation();
    handleDisable();
  };

  return (
    <div className="column is-4">
      <div className={`box integration-button-box ${inactive ? "is-inactive" : ""}`} role="button" onClick={() => handleClick()} onKeyPress={() => handleClick()} tabIndex={0}>
        <article className="media">
          <div className="media-left">
            <figure className="icon is-large">
              <i className={`fa-3x ${icon}`} />
            </figure>
          </div>
          <div className="media-content">
            <div className="content">
              <span className="is-size-5">{name}</span>
              <p>{shortDesc}</p>
            </div>
          </div>
          {/* Button label (it is actually only an X) because ESLint ¯\_(ツ)_/¯ */}
          {!inactive && <button type="button" className="delete" onClick={handleDisableStopProp}>Delete</button>}
        </article>
      </div>
    </div>
  );
};
export default IntegrationButton;
