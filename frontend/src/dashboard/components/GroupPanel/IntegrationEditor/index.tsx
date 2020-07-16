// Created by josh on 07/06/2020
import React, { FunctionComponent, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";

import { DiscordBotConfig, IntegrationType } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import SetupDiscord from "./SetupDiscord";

interface IntegrationProps {}

const IntegrationEditor: FunctionComponent<IntegrationProps> = () => {
  const { integrationId } = useParams<{ integrationId: string }>();
  const { goBack } = useHistory();
  const [group] = useContext(GroupContext);

  if (!group) return null;

  const integration = group.integrations.find(i => i.id === integrationId);

  if (!integration) {
    goBack();
    return null;
  }

  let renderIntegration = null;

  switch (integration.type) {
    case IntegrationType.discordBot:
      // Safe cast, we checked `integration.type`
      renderIntegration = <SetupDiscord config={integration.config as DiscordBotConfig} />;
      break;

    default:
      break;
  }

  return (
    <section className="section content">
      {renderIntegration}
    </section>
  );
};
export default IntegrationEditor;
