import React, { FunctionComponent, useState } from "react";


import LoginForm from "./Authentication/Login";
import RegisterForm from "./Authentication/Register";
// Unauthenticated app state "page"
enum AppState {
  index,
  login,
  register
}
interface UnauthenticatedAppProps {
  setUser: Function
}

// Could probably make some of this shared i.e. put the conditionals within children
const UnauthenticatedApp: FunctionComponent<UnauthenticatedAppProps> = ({ setUser }) => {
  const [appState, setState] = useState<AppState>(AppState.index);
  if (appState === AppState.index) {
    return (
      <div className="has-text-centered">
        <p>Hello: Dashboard root.</p>

        <br />
        {/* Temp, of course */}
        <div className="buttons is-centered">
          <button className="button is-primary" type="button" onClick={() => setState(AppState.register)}>Sign up</button>
          <button className="button" type="button" onClick={() => setState(AppState.login)}>Sign in</button>
        </div>

      </div>
    );
  }
  return (
    <div className="columns is-centered">
      <div className="column is-10-mobile is-4-desktop">
        {
            appState === AppState.login
              ? <LoginForm toRegister={() => setState(AppState.register)} setUser={setUser} />
              : <RegisterForm toLogin={() => setState(AppState.login)} setUser={setUser} />
          }
      </div>
    </div>
  );
};

export default UnauthenticatedApp;
