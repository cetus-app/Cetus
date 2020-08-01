import React, { FunctionComponent } from "react";

import { IntegrationInfo } from "../../../api/types";

interface DeleteModalProps {
  meta: IntegrationInfo,
  close: Function,
  onDisable: Function
}

const DisableModal: FunctionComponent<DeleteModalProps> = ({ meta: { name, icon }, close, onDisable }) => (
  <div className="modal is-active">
    <div className="modal-background" onClick={() => close(false)} tabIndex={-1} role="presentation" />
    <div className="modal-card">
      <header className="modal-card-head">
        <span className="icon"><i className={icon} /> </span>
        <p className="modal-card-title">Disabling {name}</p>
        <button className="delete" type="button" aria-label="close" onClick={() => close(false)} />
      </header>
      <section className="modal-card-body">
        <p>
          Are you sure you want to disable {name} in your group?
          This action is irreversible and will permanently delete the configuration for this integration.
        </p>
        <br />
        <p>
          <i>
            Clicking the <code>Disable</code> button below will update your subscription with
            Stripe, our payment processor, to remove {name}.
          </i>
        </p>
      </section>

      <footer className="modal-card-foot">
        <button type="button" className="button is-danger" onClick={() => onDisable()}>Disable</button>
        <button type="button" className="button" onClick={() => close(false)}>Cancel</button>
      </footer>
    </div>
  </div>
);

export default DisableModal;
