// Created by josh on 07/06/2020
import React, {
  Fragment, FunctionComponent, useContext, useEffect, useState
} from "react";
import { Redirect, useHistory, useRouteMatch } from "react-router-dom";

import { disableIntegration, getMetas } from "../../../api/integrations";
import { IntegrationInfo, IntegrationMeta, PartialIntegration } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import { typedKeys } from "../../shared";
import DisableModal from "./DisableModal";
import IntegrationButton from "./IntegrationButton";
import PurchaseModal from "./PurchaseModal";


interface IntegrationsProps {

}
interface IntegrationState {
  unused: IntegrationInfo[]
  info: IntegrationMeta
}

const Integrations: FunctionComponent<IntegrationsProps> = () => {
  const [grp, setGrp] = useContext(GroupContext);
  const history = useHistory();
  const { url } = useRouteMatch();
  const [purchaseModal, setModal] = useState<IntegrationInfo>();
  const [disableModal, setDisableModal] = useState<PartialIntegration & IntegrationInfo>();
  const [integrationInfo, setInfo] = useState<IntegrationState|undefined>();
  const [error, setError] = useState("");

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

  if (grp && !grp.stripeSubscriptionId) {
    return <Redirect to={`/subscribe/${grp.id}`} />;
  }

  async function handleDisable (id: string): Promise<void> {
    try {
      setDisableModal(undefined);

      await disableIntegration(id);

      if (!grp) return;

      const integrations = grp.integrations.slice();
      const index = integrations.findIndex(i => i.id === id);
      integrations.splice(index, 1);

      const newGroup = {
        ...grp,
        integrations
      };
      setGrp(newGroup);
    } catch (e) {
      setError("Error occurred while removing integration from subscription. Contact support if the issue persists");
    }
  }

  if (!grp || !integrationInfo) {
    return <p className="has-text-centered has-text-grey">Loading...</p>;
  }
  return (
    <Fragment>
      <div className="integrations-menu">
        {purchaseModal ? <PurchaseModal meta={purchaseModal} close={() => setModal(undefined)} groupId={grp.id} /> : ""}
        {disableModal ? <DisableModal meta={disableModal} close={() => setDisableModal(undefined)} onDisable={() => handleDisable(disableModal.id)} /> : ""}
        <h1 className="title">Integrations</h1>
        <p>You can find a list of available integrations for your group here -
          this includes both those enabled and disabled integrations.
        </p>
        <p className="last-para">Integrations are individually priced. Click an integration to configure it, or find out more information.</p>
        {error && <p className="has-text-danger last-para">{error}</p>}
        <div className="columns is-mobile is-multiline">
          {
              grp.integrations.map((i:PartialIntegration) => (
                <IntegrationButton
                  meta={integrationInfo.info[i.type]}
                  handleClick={() => handleClick(i.id)}
                  handleDisable={() => setDisableModal({
                    ...integrationInfo.info[i.type],
                    ...i
                  })}
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
