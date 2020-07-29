import React, { FunctionComponent, ReactNode, useState } from "react";

import "../../assets/scss/acccount.scss";
import UpdatePassword from "./UpdatePassword";
import DeleteAccount from "./DeleteAccount";

interface shownMessage {
  messageContent: ReactNode,
  notificationType: string
}

const Account: FunctionComponent = () => {
  const [message, setMessage] = useState<shownMessage|undefined>();
  function handlePasswordChange () {
    setMessage({
      notificationType: "success",
      messageContent: <p>Successfully updated your password!</p>
    });
  }
  return (
    <div className="section">
      <div className="columns is-centered">
        <div className="column is-6">
          {message ? (
            <div className={`notification is-${message.notificationType}`}>
              <button type="button" onClick={() => setMessage(undefined)} className="delete">Delete</button>
              {message.messageContent}
            </div>
          ) : ""}
          <h1 className="title">Account settings</h1>
          <h2 className="subtitle">Password management</h2>
          <UpdatePassword handleDone={handlePasswordChange} />
          {/* Email */}
          {/* Delete account/Sign out all sessions */}
          {/* Read only: Roblox info?, Email verified? */}
          {/* Log out */}
          <h1 className="subtitle is-4 has-text-danger dgr">Danger zone</h1>
          <p>This area contains potentially destructive actions. Tread carefully!</p>
          <div className="buttons">
            <DeleteAccount />
            <button className="button" type="button">Sign out all sessions</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
