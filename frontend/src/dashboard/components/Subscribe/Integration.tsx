import React, { FunctionComponent } from "react";

import { IntegrationInfo, IntegrationType } from "../../api/types";

export interface IntegrationProps {
  type: IntegrationType;
  meta: IntegrationInfo;
  showMore: boolean;
  onShowClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  enabled: boolean;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Integration: FunctionComponent<IntegrationProps> = ({
  type, meta: {
    name, icon, shortDesc, longDesc, cost
  }, showMore, onShowClick, enabled, onToggle
}) => (
  <div className="box subscribe-integration">
    <div className="media">
      <div className="media-left">
        {/* Respect Discord's branding guidelines - https://discord.com/new/branding */}
        <span className={`icon is-large ${type === IntegrationType.discordBot ? "has-text-black" : "has-text-primary"}`}>
          <i className={`${icon} fa-3x fa-fw`} />
        </span>
      </div>

      <div className="media-content">
        <div className="content">
          <p className="is-marginless">
            <strong>{name}</strong> - {shortDesc}
            <br />
            {
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                }<a href="#" onClick={onShowClick}>{showMore ? "Show less" : "Show more"}</a>
          </p>

          <p />
          {showMore && <p style={{ whiteSpace: "pre-line" }}>{longDesc}</p>}
        </div>
      </div>

      <div
        className="media-right"
        style={{ minWidth: "120px" }}>
        <p>Cost: £{cost}/month</p>

        <div className="control">
          <input id={type} type="checkbox" className="switch is-success" onChange={onToggle} />
          <label htmlFor={type}>{enabled ? "Enabled" : "Disabled"}</label>
        </div>
      </div>
    </div>
  </div>
);

export default Integration;
