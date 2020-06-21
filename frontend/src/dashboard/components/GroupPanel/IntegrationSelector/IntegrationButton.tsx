import React, { FunctionComponent } from "react";

import { IntegrationInfo } from "../../../api/types";

interface IntegrationButtonProps {
  meta: IntegrationInfo,
  handleClick: Function,
  inactive?: boolean
}

const IntegrationButton: FunctionComponent<IntegrationButtonProps> = ({ meta, handleClick, inactive }) => {
  const {
    name = "Unnamed",
    shortDesc = "No description provided.",
    icon = "fas fa-rocket"
  } = meta || {};
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
        </article>
      </div>
    </div>

  );
};
export default IntegrationButton;
