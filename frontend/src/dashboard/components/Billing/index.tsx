import React, { Fragment, useContext, useState } from "react";
import { Link } from "react-router-dom";

import { createPortalSession } from "../../api";
import GroupContext from "../../context/GroupContext";

export const Billing = () => {
  const [group] = useContext(GroupContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!group) return <p>Loading..</p>;

  const createSession = (): void => {
    setLoading(true);
    setError("");
    createPortalSession({ groupId: group.id }).then(({ url }) => {
      window.location.href = url;
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  };

  return (
    <Fragment>
      <h1 className="title">Billing</h1>
      <p>You can find billing information in the email receipt we sent when you signed up to our service.</p>
      <p>If you would like to some billing assistance, <a href={process.env.discordInvite}>join our discord</a>.
        We&apos;d be happy to help!
      </p>
      {group.stripeSubscriptionId && (
        <Fragment>
          <br />
          <p>
            You can also click the button below to go to the Stripe customer portal to manage your subscription. Please note that adding or removing integrations is only available through the <Link to={`/groups/${group.id}/integrations`}>dashboard</Link>.
          </p>
          <button type="button" className={`button is-info${loading ? ` is-loading` : ""}`} disabled={loading} onClick={createSession}>Go to customer portal</button>
          {error && <p className="has-text-danger">{error}</p>}
        </Fragment>
      )}

      {!group.stripeSubscriptionId
        ? (
          <div className="notification mt-2 is-light">
            You are currently using a <strong>free group</strong>. If you would like to subscribe and get benefits such as:
            <div className="content">
              <ul>
                <li>No request limits</li>
                <li>Integrations</li>
                <li>Development support to use our service</li>
              </ul>
            </div>

            You can click <Link to={`/subscribe/${group.id}`}>here</Link> to go pro.
          </div>
        )

        : ""}
    </Fragment>
  );
};
export default Billing;
