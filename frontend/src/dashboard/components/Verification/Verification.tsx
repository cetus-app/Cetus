import React, { Fragment, FunctionComponent, useState } from "react";

import "./Verification.css";
import {
  ApiError, check, startVerification, verifyBlurb
} from "../../api";
import { StartVerificationResponse } from "../../api/types";
import { InputChange } from "../../types";
import BlurbVerification from "./BlurbVerification";
import GameVerification from "./GameVerification";
import StartVerification from "./StartVerification";

const Verify: FunctionComponent = () => {
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [verification, setVerification] = useState<StartVerificationResponse | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleUsernameChange: InputChange = event => setUsername(event.target.value);

  const handleStart = async (blurb: boolean) => {
    if (username.trim() === "") return;

    setError("");

    try {
      const result = await startVerification(username, blurb);

      setVerification(result);
    } catch (e) {
      if (e instanceof ApiError) {
        const res = await e.response.json();

        // Map these in the future (to Formik, Eirik has a utility for this already)
        if (res.errors) setError("Form errors");
        else if (res.message) setError(res.message);
        else setError("Error occurred. Please try again");
      }
    }

    setVerification(await startVerification(username, blurb));
  };

  const handleVerify = async (blurb: boolean) => {
    if (!verification) return;

    setError("");

    const checkFn = blurb ? verifyBlurb : check;

    try {
      const result = await checkFn(verification.rId);

      if (result.success) setCompleted(true);
      else {
        setError(result.message);
      }
    } catch (e) {
      setError("Error occurred. Please try again");
    }
  };

  return (
    <section className="section columns is-centered">
      <div className="verify-box column is-three-fifths-tablet is-two-fifths-widescreen is-one-third-fullhd is box has-background-grey-light has-text-black">
        {!verification && <StartVerification username={username} onUsernameChange={handleUsernameChange} onClick={handleStart} />}

        {(!completed && verification?.blurbCode)
          && <BlurbVerification username={username} code={verification.blurbCode} onClick={() => handleVerify(true)} />}

        {(!completed && verification?.code)
          && <GameVerification username={username} code={verification.code.toString()} onClick={() => handleVerify(false)} />}

        {completed && (
          <div>Your Roblox account ({username}) is now verified in the Cetus system. You can now register and set up your groups!</div>
        )}

        {error && (
          <Fragment>
            <br />
            <p className="has-text-danger has-text-centered">{error}</p>
          </Fragment>
        )}
      </div>
    </section>
  );
};

export default Verify;
