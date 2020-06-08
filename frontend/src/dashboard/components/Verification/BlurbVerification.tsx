import React, { FunctionComponent } from "react";

import { ButtonClick } from "../../types";

interface BlurbVerificationProps {
  username: string;
  code: string;
  onClick: ButtonClick;
}

const BlurbVerification: FunctionComponent<BlurbVerificationProps> = ({ username, code, onClick }) => {
  const handleCopy = () => navigator.clipboard.writeText(code);

  return (
    <div className="verify-blurb">
      <h2 className="subtitle has-text-black">
        You are now verifying as {username}
      </h2>

      <div className="content has-text-left">
        <i>
          In order to verify your account, do the following:
          Go to your Roblox <a href="https://www.roblox.com/my/account#!/info" target="_blank" rel="noopener noreferrer">settings</a>&#32;
          in the upper right corner of the Roblox website.
          Under personal, paste the code below anywhere in the text (bio) box.
          Remember to press the save button further down that page.
        </i>
      </div>

      <div className="code-container has-background-grey">
        <code className="has-background-grey has-text-white">{code}</code>
      </div>

      <br />

      <div className="field is-grouped is-grouped-centered">
        <div className="control">
          <button type="button" className="button is-dark" onClick={handleCopy}>Copy code to clipboard</button>
        </div>

        <div className="control">
          <button type="button" className="button is-success" onClick={onClick}>Done!</button>
        </div>
      </div>
    </div>
  );
};

export default BlurbVerification;
