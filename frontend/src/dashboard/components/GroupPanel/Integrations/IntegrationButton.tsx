import React, { FunctionComponent } from "react";

import Integration from "../../../api/types/Integration";


interface IntegrationButtonProps {
  integration: Integration
}

const IntegrationButton: FunctionComponent<IntegrationButtonProps> = ({ integration }) => {
  const { meta } = integration;
  const [
    name = "Unnamed",
    desc = "No description provided.",
    icon = "fas fa-rocket"
  ] = meta || [];
  return (
    <div className="column is-4">
      <div className="box integration-button-box">
        <article className="media">
          <div className="media-left">
            <figure className="icon is-large">
              <i className={`fa-3x ${icon}`} />
            </figure>
          </div>
          <div className="media-content">
            <div className="content">
              <span className="is-size-5">{name}</span>
              <p>{desc}</p>
            </div>
          </div>
        </article>
      </div>
    </div>

  );
};
export default IntegrationButton;
