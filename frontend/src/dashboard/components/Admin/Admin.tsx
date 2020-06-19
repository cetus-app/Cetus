import React, { FunctionComponent } from "react";
import { Link, useRouteMatch } from "react-router-dom";

const Admin: FunctionComponent = () => {
  const { url } = useRouteMatch();

  return (
    <section className="section columns is-centered">
      <div className="content column is-10">
        <h1 className="title">Admin</h1>
        <ul>
          <li>
            <h4>Bots</h4>
            <ul>
              <li>
                <Link to={`${url}/bots/manage`}>Manage</Link>
              </li>
              <li>
                <Link to={`${url}/bots/queue`}>Queue</Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Admin;
