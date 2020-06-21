// Created by josh on 07/06/2020
import React, {
  Fragment, FunctionComponent, useContext, useEffect, useState
} from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

import { getMetas } from "../../../api/integrations";
import { IntegrationInfo, IntegrationMeta, PartialIntegration } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import { typedKeys } from "../../shared";
import IntegrationButton from "./IntegrationButton";
import PurchaseModal from "./PurchaseModal";


interface IntegrationsProps {

}
interface IntegrationState {
  unused: IntegrationInfo[]
  info: IntegrationMeta
}

const Integrations: FunctionComponent<IntegrationsProps> = () => {
  const [grp] = useContext(GroupContext);
  const history = useHistory();
  const { url } = useRouteMatch();
  const [modal, setModal] = useState<IntegrationInfo>();
  const [integrationInfo, setInfo] = useState<IntegrationState|undefined>();

  useEffect(() => {
    (async function get () {
      if (!grp) return;
      const res: IntegrationMeta = await getMetas();
      // Iterates returned keys and "in use" integration types to check for matching - meaning it's already "enabled"
      const metas = typedKeys(res).filter(t => grp.integrations && !grp.integrations.some(i => i.type === t));

      // Converts that array of strings into an array of the objects
      const available = metas.map(s => {
        res[s].type = s;
        return res[s];
      });
      setInfo({
        unused: available,
        info: res
      });
    }());
  }, [grp]);

  function handleClick (id: string) {
    history.push(`${url}/${id}`);
  }
  if (!grp || !integrationInfo) {
    return <p className="has-text-centered has-text-grey">Loading...</p>;
  }
  return (
    <Fragment>
      <div className="integrations-menu">
        {modal ? <PurchaseModal meta={modal} close={() => setModal(undefined)} groupId={grp.id} /> : ""}
        <h1 className="title">Integrations</h1>
        <p>You can find a list of available integrations for your group here -
          this includes both those enabled and disabled integrations.
        </p>
        <p className="last-para">Integrations are individually priced. Click an integration to configure it, or find out more information.</p>
        <div className="columns is-mobile is-multiline">
          {
              grp.integrations.map((i:PartialIntegration) => (
                <IntegrationButton
                  meta={integrationInfo.info[i.type]}
                  handleClick={() => handleClick(i.id)}
                  key={i.id} />
              ))
            }
          {
              integrationInfo.unused.map(i => <IntegrationButton meta={i} handleClick={() => setModal(i)} key={i.name} inactive />)
            }
        </div>
      </div>
    </Fragment>

  );
};
export default Integrations;