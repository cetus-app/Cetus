// The entry point for the panel React application.
// index.tsx
import "regenerator-runtime/runtime"; // https://github.com/parcel-bundler/parcel/issues/1762

import React from "react";
import ReactDOM from "react-dom";

import "./panel.css";
import "bulma/bulma.sass";
import App from "./components/App";

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
