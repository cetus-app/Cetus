import React, { FunctionComponent, useState } from "react";


import LoginForm from "./Authentication/Login";
import RegisterForm from "./Authentication/Register";
// Unauthenticated app state "page"
enum AppState {
  login,
  register
}
interface UnauthenticatedAppProps {
  setUser: Function
}

// Could probably make some of this shared i.e. put the conditionals within children
const UnauthenticatedApp: FunctionComponent<UnauthenticatedAppProps> = ({ setUser }) => {
  const [appState, setState] = useState<AppState>(AppState.login);
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
