import React, { FunctionComponent, useContext, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

import { enableIntegration } from "../../../api";
import { IntegrationInfo } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";

interface PurchaseModalProps {
  meta: IntegrationInfo,
  close: Function,
  groupId: string
}

const PurchaseModal: FunctionComponent<PurchaseModalProps> = ({ meta, close, groupId }) => {
  const history = useHistory();
  const { url } = useRouteMatch();
  const {
    name = "Unnamed",
    shortDesc = "No description provided.",
    longDesc = "Long desc.",
    cost,
    icon,
    type
  } = meta;
  const [group, setGroup] = useContext(GroupContext);
  const [error, setError] = useState<undefined|string>();
  async function enable () {
    if (!type) {
      // Shouldn't happen
      setError("Failed - No type available. This shouldn't happen.");
      throw new Error("No type available.");
    }
    try {
      const res = await enableIntegration(groupId, type);
      if (!group) return;

      const integrations = group.integrations.slice();
      integrations.push(res);

      const newGroup = {
        ...group,
        integrations
      };
      setGroup(newGroup);

      history.push(`${url}/${res.id}`);
    } catch (err) {
      if ("response" in err) {
        const resp = await err.response.json();
        setError(`${resp.name}: ${resp.message}`);
      } else {
        throw new Error(err);
      }
    }
  }
  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={() => close(false)} tabIndex={-1} role="presentation" />
      <div className="modal-card">
        <header className="modal-card-head">
          <span className="icon"><i className={icon} /> </span>
          <p className="modal-card-title">{name}</p>
          <button className="delete" type="button" aria-label="close" onClick={() => close(false)} />
        </header>
        <section className="modal-card-body">
          <p className="subtitle">{shortDesc}</p>
          <p className="modal-desc">{longDesc}</p>
          <p>This feature is billed at <strong>£{cost}</strong> per month.</p>
          <br />
          <p>
            <i>
              Clicking the <code>Enable</code> button below will update your subscription with
              Stripe, our payment processor, to include {name}.
            </i>
          </p>
          {error ? <p className="has-text-danger">{error}</p> : ""}
        </section>

        <footer className="modal-card-foot">
          <button type="button" className="button is-primary" onClick={enable}>Enable</button>
          <button type="button" className="button" onClick={() => close(false)}>Cancel</button>
        </footer>
      </div>
    </div>

  );
};
export default PurchaseModal;
