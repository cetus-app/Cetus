import React, { FunctionComponent, useContext } from "react";
import { Redirect } from "react-router-dom";

import UserContext from "../context/UserContext";
import Verify from "./Verification/Verification";

const AuthenticatedApp: FunctionComponent = () => {
  const user = useContext(UserContext);

  if (!user) return <Redirect to="/signup" />;

  if (!user.rId) return <Verify />;

  return (
    <div className="has-text-centered">{user.email}</div>
  );
};

export default AuthenticatedApp;
