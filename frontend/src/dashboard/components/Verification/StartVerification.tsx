import React, { Fragment, FunctionComponent } from "react";

import { InputChange } from "../../types";

interface StartVerificationProps {
  username: string;
  onUsernameChange: InputChange;
  onClick (blurb: boolean): void;
}

const StartVerification: FunctionComponent<StartVerificationProps> = ({ username, onUsernameChange, onClick }) => (
  <Fragment>
    <h1 className="title has-text-black">Hi there!</h1>
    <p>To get started, you will need to link your Roblox account. Please enter your username below.</p>

    <br />

    <div className="field username-field">
      <label className="label has-text-black">Username</label>

      <div className="control">
        <input type="text" className="input is-static has-background-grey has-text-black" value={username} onChange={onUsernameChange} />
      </div>
    </div>

    <p>You can choose to verify your account by entering a code into your profile bio, or by joining our verification game.</p>

    <br />

    <div className="field is-grouped">
      <div className="control">
        <button type="button" className="button is-dark" onClick={() => onClick(true)}>Use profile code</button>
      </div>

      <div className="control">
        <button type="button" className="button is-success" onClick={() => onClick(false)}>Open game</button>
      </div>
    </div>
  </Fragment>
);

export default StartVerification;
