import React, { FunctionComponent, useState } from "react";
// Unauthenticated app state "page"
enum AppState {
  index,
  login,
  register
}
// Could probably make some of this shared i.e. put the conditionals within children
const UnauthenticatedApp: FunctionComponent = () => {
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
  if (appState === AppState.login) {
    return <h1>Login</h1>;
  }
  return <h1>Register</h1>;
};

export default UnauthenticatedApp;
