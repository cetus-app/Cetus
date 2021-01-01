import React, { Fragment, useContext } from "react";
import { Link } from "react-router-dom";

import GroupContext from "../../context/GroupContext";

export const Billing = () => {
  const [group] = useContext(GroupContext);
  return (
    <Fragment>
      <h1 className="title">Billing</h1>
      <p className="subtitle">Coming soon!</p>
      <p>You can find billing information in the email receipt we sent when you signed up to our service.</p>
      <p>If you would like to some billing assistance, <a href={process.env.discordInvite}>join our discord</a>.
        We&apos;d be happy to help!
      </p>
      {group && !group.stripeSubscriptionId
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
