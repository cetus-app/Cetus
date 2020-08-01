import React, { FunctionComponent } from "react";

import { signOut } from "../../api/account";
import { shownMessage } from "./index";

interface SignOutAllProps {
  setMessage: Function
}
const SignOutAll: FunctionComponent<SignOutAllProps> = ({ setMessage }) => {
  async function signOutAll () {
    try {
      await signOut(true);
      const obj: shownMessage = {
        messageContent: <p>Successfully signed out all other sessions. You will need to log back in on other devices.</p>,
        notificationType: "success"
      };
      setMessage(obj);
    } catch (_e) {
      const obj: shownMessage = {
        messageContent: <p>Failed to sign out all sessions.</p>,
        notificationType: "danger"
      };
      setMessage(obj);
    }
  }
  return (<button className="button" type="button" onClick={signOutAll}>Sign out all sessions</button>);
};

export default SignOutAll;
