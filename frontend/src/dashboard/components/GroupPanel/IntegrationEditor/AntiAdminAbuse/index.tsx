// Created by josh on 07/06/2020
import React, { FunctionComponent, useContext } from "react";

import { AntiAbuseConfigBody } from "../../../../../../../backend/controllers/IntegrationController/types";
import { IntegrationProps } from "../index";
import AntiAbuseForm from "./AntiAbuseForm";
import BotViewer from "./BotViewer";

const AntiAdminAbuse: FunctionComponent<IntegrationProps> = ({ integration, update, group }) => {
  const config = integration.config as AntiAbuseConfigBody;
  console.log(group);
  return (
    <div className="group-defender">
      <h1 className="title">Group defender</h1>

      <p className="desc"><EnabledTag enabled={config.enabled} /> Group Defender detects and reverts possible Admin Abuse against your Roblox group.</p>
      {!config.enabled ? (
        <div className="notification is-warning">
          <i className="fas fa-exclamation" /> Warning: Your group is vulnerable! Group Defender is not protecting your group.
        </div>
      ) : ""}

      <div className="columns">
        <div className="column is-8">
          <BotViewer group={group} />
          <AntiAbuseForm integration={integration} update={update} />
        </div>
      </div>


    </div>
  );
};
export default AntiAdminAbuse;
interface TagProps {
  enabled: boolean
}
const EnabledTag = ({ enabled }:TagProps) => (enabled ? <span className="tag is-success">Enabled</span> : <span className="tag is-danger">Disabled</span>);
