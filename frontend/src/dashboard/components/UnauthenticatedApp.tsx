import React, { FunctionComponent } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import FinishReset from "./Authentication/FinishReset";
import LoginForm from "./Authentication/Login";
import PasswordReset from "./Authentication/PasswordReset";
import RegisterForm from "./Authentication/Register";

interface UnauthenticatedAppProps {
  setUser: Function
}

// Could probably make some of this shared i.e. put the conditionals within children
const UnauthenticatedApp: FunctionComponent<UnauthenticatedAppProps> = ({ setUser }) => (
  <div className="columns is-centered">
    <div className="column is-10-mobile is-4-desktop">
      <Switch>
        <Route exact path="/login">
          <LoginForm setUser={setUser} />
        </Route>
        <Route exact path="/register">
          <RegisterForm setUser={setUser} />
        </Route>
        <Route exact path="/reset">
          <PasswordReset />
        </Route>
        <Route exact path="/finish-reset">
          <FinishReset />
        </Route>
        <Redirect to="/login" from="/" />
      </Switch>
    </div>
  </div>
);

export default UnauthenticatedApp;
