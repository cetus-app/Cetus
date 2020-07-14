// Created by josh on 07/06/2020
import React, { FunctionComponent, useContext } from "react";
import { Redirect, useParams } from "react-router-dom";

import Integration from "../../../../../../backend/entities/Integration.entity";
import {FullGroup, IntegrationType, PartialGroup, PartialIntegration} from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import AntiAdminAbuse from "./AntiAdminAbuse";


interface GroupHomeProps {

}
// Atm. the plan is for every Integration to have it's own 'Editor' which makes use of these props
// For consistency
export interface IntegrationProps {
  integration: PartialIntegration,
  update: Function,
  group: FullGroup
}
const IntegrationEditor: FunctionComponent<GroupHomeProps> = props => {
  const { integrationId } = useParams();
  const [group, setGroup] = useContext(GroupContext);
  console.log("Re-render");
  if (!group) {
    return <p>Loading...</p>;
  }
  const integration = group.integrations.find(i => i.id === integrationId);
  if (!integration) {
    return <Redirect to={`/groups/${group.id}/integrations`} />;
  }
  function updateIntegration (newIntegration: PartialIntegration) {
    console.log("Update!");
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
    console.log(newGroup);
  }

  if (integration.type === IntegrationType.antiAdminAbuse) {
    return <AntiAdminAbuse integration={integration} update={updateIntegration} group={group} />;
  }
  return (
    <div>
      <h1>Integration manager!!</h1>
      <p>This will: Fetch full integration & render the appropriate menu based on its type.</p>
      <p>{integrationId}</p>
    </div>
  );
};
export default IntegrationEditor;
