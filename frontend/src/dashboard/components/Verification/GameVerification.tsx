import React, { FunctionComponent } from "react";

import { ButtonClick } from "../../types";

interface GameVerificationProps {
  username: string;
  code: string;
  onClick: ButtonClick;
}

const GameVerification: FunctionComponent<GameVerificationProps> = ({ username, code, onClick }) => {
  // Using index as key is fine as order will not change
  // eslint-disable-next-line react/no-array-index-key
  const codeHtml = [...code].map((digit, index) => <span key={index} className="game-code-digit has-background-grey has-text-weight-semibold">{digit}</span>);

  return (
    <div className="verify-game">
      <h2 className="subtitle has-text-black">
        You are now verifying as {username}
      </h2>

      <div className="content has-text-left">
        <i>
          In order to verify your account, open <a href="https://www.roblox.com/games/5077391546/Cetus-Verification" target="_blank" rel="noopener noreferrer">this</a> Roblox game and enter the code below when prompted.
        </i>
      </div>

      <div className="game-code-container">
        {codeHtml}
      </div>

      <br />

      <div className="has-text-centered has-text-weight-semibold">
        <i>Pending verification..</i>
      </div>

      <br />

      <p>
        Have you entered the code, but still waiting?
        <br />
        <button type="button" className="button is-dark is-small force-game-check-button" onClick={onClick}>Check manually</button>
      </p>
    </div>
  );
};

export default GameVerification;
