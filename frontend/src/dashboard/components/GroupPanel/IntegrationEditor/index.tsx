// Created by josh on 07/06/2020
import React, { FunctionComponent, useContext } from "react";
import { Redirect, useParams } from "react-router-dom";

import { FullGroup, IntegrationType, PartialIntegration } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import AntiAdminAbuse from "./AntiAdminAbuse";
import SetupDiscord from "./SetupDiscord";

// Atm. the plan is for every Integration to have it's own 'Editor' which makes use of these props
// For consistency
export interface IntegrationProps {
  integration: PartialIntegration,
  update: Function,
  group: FullGroup
}

const IntegrationEditor: FunctionComponent = () => {
  const { integrationId } = useParams();
  const [group, setGroup] = useContext(GroupContext);

  if (!group) {
    return <p>Loading...</p>;
  }

  const integration = group.integrations.find(i => i.id === integrationId);

  if (!integration) {
    return <Redirect to={`/groups/${group.id}/integrations`} />;
  }

  function updateIntegration (newIntegration: PartialIntegration) {
    if (!group) throw new Error("no group");
    const newIntegrations = [...group.integrations];
    let done = false;
    for (let i = 0; i < newIntegrations.length; i++) {
      if (newIntegrations[i].id === newIntegration.id) {
        newIntegrations[i] = newIntegration;
        done = true;
        break;
      }
    }
    if (!done) {
      window.location.reload();
      throw new Error("Failed to find integration by id. Has it been removed?");
    }
    const newGroup = { ...group };
    newGroup.integrations = newIntegrations;
    setGroup(newGroup);
  }

  let renderIntegration = null;

  switch (integration.type) {
    case IntegrationType.discordBot:
      // Safe cast, we checked `integration.type`
      renderIntegration = <SetupDiscord integration={integration} update={updateIntegration} group={group} />;
      break;

    case IntegrationType.antiAdminAbuse:
      renderIntegration = <AntiAdminAbuse integration={integration} update={updateIntegration} group={group} />;
      break;

    default:
      break;
  }

  return (
    <section className="container">
      {renderIntegration}
    </section>
  );
};
export default IntegrationEditor;
