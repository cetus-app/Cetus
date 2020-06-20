// Created by josh on 07/06/2020
import React, { FunctionComponent, useContext } from "react";

import GroupContext from "../../../context/GroupContext";
import IntegrationButton from "./IntegrationButton";


interface IntegrationsProps {

}

const Integrations: FunctionComponent<IntegrationsProps> = props => {
  const [grp] = useContext(GroupContext);
  if (!grp) {
    return <p>Loading group...</p>;
  }
  return (
    <div>
      <h1 className="title">Integrations</h1>
      <div className="columns is-mobile is-multiline">
        {
          grp.integrations.map(i => <IntegrationButton integration={i} />)
        }
      </div>


    </div>
  );
};
export default Integrations;
