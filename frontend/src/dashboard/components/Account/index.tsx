import React, {
  FunctionComponent, ReactNode, useContext, useState
} from "react";

import "../../assets/scss/acccount.scss";
import { signOut } from "../../api/account";
import UserContext from "../../context/UserContext";
import DeleteAccount from "./DeleteAccount";
import EmailManager from "./EmailManager";
import SignOutAll from "./SignOutAll";
import UpdatePassword from "./UpdatePassword";

export interface shownMessage {
  messageContent: ReactNode,
  notificationType: string
}

const Account: FunctionComponent = () => {
  const [message, setRawMessage] = useState<shownMessage|undefined>();
  const user = useContext(UserContext);
  function setMessage (msg?: shownMessage) {
    setRawMessage(msg);
    window.scrollTo(0, 0);
  }

  function handlePasswordChange () {
    setMessage({
      notificationType: "success",
      messageContent: <p>Successfully updated your password!</p>
    });
  }
  async function handleSignOut () {
    await signOut();
    window.location.href = "/";
  }
  if (!user) {
    return <p>Loading...</p>;
  }
  const created = new Date(user.created);
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
          <h2 className="subtitle is-4">Account info</h2>
          <div className="account-info">
            <p>ID: <code>{user.id}</code></p>
            <p>Roblox id: <code>{user.robloxId || "Not set"}</code></p>
            <p>Email verified: {user.emailVerified ? "Yes" : "No"}</p>
            <p>Account created: {`${created.getDate()}/${created.getMonth()}/${created.getFullYear()}`}</p>
          </div>

          <h2 className="subtitle is-4">Password management</h2>
          <UpdatePassword handleDone={handlePasswordChange} />

          <h2 className="subtitle is-4">Email</h2>
          <EmailManager setMessage={setMessage} email={user.email} isVerified={user.emailVerified || false} />
          <h2 className="subtitle is-4">Session management</h2>
          <div className="buttons">
            <SignOutAll setMessage={setMessage} />
            <button onClick={handleSignOut} type="button" className="button">Sign out</button>
          </div>

          <h1 className="subtitle is-4 has-text-danger dgr">Danger zone</h1>
          <p>This area contains potentially destructive actions. Tread carefully!</p>
          <div className="buttons">
            <DeleteAccount />

          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
