import React, { FunctionComponent, useContext } from "react";
import { Link } from "react-router-dom";

import "./index.scss";
import GroupContext from "../../../context/GroupContext";

const APIDocs: FunctionComponent = () => {
  const [group] = useContext(GroupContext);

  if (!group) return null;

  return (
    <section className="section api-docs">
      <div className="content">
        <h1 className="title">API documentation</h1>
        <p>
          You can use this page to test our API methods using <a target="_blank" rel="noopener noreferrer" href="https://swagger.io/tools/swagger-ui/">Swagger UI</a>.
          An authentication key (configure <Link to={`/groups/${group.id}`}>here</Link>) is required in order to use these endpoints.
          We already prefilled Swagger UI with the first API key configured for your group (if any) so you can get straight to testing!
          Remember to be careful, as actions executed here will affect your actual Roblox group!
        </p>
      </div>

      <div className="swagger-ui content box has-background-light">
        <iframe title="Swagger UI docs" src={`${process.env.BACKEND_URL}/docs`} frameBorder="0" width="100%" height="100%" />
      </div>
    </section>
  );
};

export default APIDocs;
