// Created by josh on 31/05/2020
import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";


export const NoMatch: FunctionComponent = () => {
  function goBack () {
    history.back();
  }
  // Not CSS because it's not worth adding a stylesheet for this
  const buttonStyle = {
    marginRight: "1em",
    marginLeft: "1em"
  };
  const imgStyle = {
    margin: "auto",
    display: "block",
    maxHeight: "45vh",
    maxWidth: "45vh"
  };
  const imgOuter = {
    background: "#2b9eb3",
    padding: "5vh",
    marginBottom: "5vh",
    height: "50vh"
  };

  return (
    <div>
      <div className="image is-square" style={imgOuter}>
        <img
          style={imgStyle}
          src="https://i.imgur.com/A040Lxr.png"
          alt="404 art" />
      </div>
      <h2 className="title is-size-3 has-text-centered"><code>404</code> Oops! We couldn&apos;t find what you were looking
        for.
      </h2>
      <h3 className="has-text-centered subtitle">Please check the URL and try again. If you followed a link here, please let us
        know.
      </h3>
      <p className="has-text-centered">
        <button type="button" className="button is-primary" onClick={goBack} style={buttonStyle}>Go back</button>
        or
        <Link className="button" to="/" style={buttonStyle}>Go home</Link>
      </p>
    </div>
  );
};
export default NoMatch;
