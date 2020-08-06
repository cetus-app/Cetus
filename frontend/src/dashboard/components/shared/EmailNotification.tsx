/*

 */

// Created by josh on 28/05/2020
import React, { FunctionComponent, useContext } from "react";
import { Link } from "react-router-dom";

import UserContext from "../../context/UserContext";


const EmailNotification: FunctionComponent = () => {
  const user = useContext(UserContext);
  if (user && !user.emailVerified) {
    return (
      <div className="notification is-warning">
        You have not verified your email. Please verify now by clicking the link in the email we sent you.
        You can resend this email on your <Link to="/account">account</Link> page
      </div>
    );
  }
  return <div />;
};
export default EmailNotification;
