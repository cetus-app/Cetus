import React, { Fragment } from "react";

export const Billing = () => (
  <Fragment>
    <h1 className="title">Billing</h1>
    <p className="subtitle">Coming soon!</p>
    <p>You can find billing information in the email receipt we sent when you signed up to our service.</p>
    <p>If you would like to some billing assistance, <a href={process.env.discordInvite}>join our discord</a>.
      We&apos;d be happy to help!
    </p>
  </Fragment>
);
export default Billing;
