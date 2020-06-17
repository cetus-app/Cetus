import React, { FunctionComponent } from "react";
import { Link, useRouteMatch } from "react-router-dom";

const Admin: FunctionComponent = () => {
  const { url } = useRouteMatch();

  return (
    <div className="columns is-centered">
      <div className="column is-10">
        <h1 className="title">Admin</h1>
        <Link to={`${url}/bot-queue`} className="is-size-5">Hi</Link>
      </div>
    </div>
  );
};

export default Admin;
