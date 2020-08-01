import React, { FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { deleteGroup } from "../../../api";
import GroupContext from "../../../context/GroupContext";

const Unlink: FunctionComponent = () => {
  const [group] = useContext(GroupContext);

  if (!group) return null;

  const { push } = useHistory();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = () => {
    setLoading(true);
    setError("");

    deleteGroup(group.id).then(() => push("/groups")).catch(() => {
      setModal(false);
      setLoading(false);
      setError("Error occurred while unlinking your group and cancelling your subscription. Please contact support if the issue persists");
    });
  };

  return (
    <section className="section columns">
      <div className={`modal${modal ? " is-active" : ""}`}>
        <div className="modal-background" />
        <div className="modal-content box content">
          <h6>Are you absolutely sure you want to unlink {group.robloxInfo.name} and destroy all associated data stored in our systems?</h6>

          <div className="buttons">
            <button type="button" className={`button is-danger${loading ? " is-loading" : ""}`} disabled={loading} onClick={handleDelete}>Unlink</button>
            <button type="button" className="button" onClick={() => setModal(false)}>Cancel</button>
          </div>
        </div>
        <button type="button" className="modal-close is-large" aria-label="close" onClick={() => setModal(false)} />
      </div>

      <div className="column is-10-desktop is-8-widescreen content">
        <h1 className="title">Unlink group</h1>
        <p>
          This page allows you to unlink your group and thus deleting it
          (and all associated data, with the exception of your account) from our systems.
          Our bot account will leave your group and any integrations currently in use will stop functioning.
          Your subscription will be cancelled with immediate effect.
        </p>
        {error && <p className="has-text-danger">{error}</p>}
        <button type="button" className="button is-danger" onClick={() => setModal(true)}>Unlink and delete group from Cetus</button>
      </div>
    </section>
  );
};

export default Unlink;
