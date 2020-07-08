import React, { Fragment, FunctionComponent } from "react";

const DiscordLogin: FunctionComponent = () => (
  <Fragment>
    <h1 className="title has-text-black">Hi there!</h1>
    <p>To get started, you will need to connect your Discord account to your Cetus account. Click the button below to proceed.</p>

    <br />

    <a href={`${process.env.BACKEND_URL}/auth/discord`} className="button is-info">Log in to Discord</a>
  </Fragment>
);

export default DiscordLogin;
