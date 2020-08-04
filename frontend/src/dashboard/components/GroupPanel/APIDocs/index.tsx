import React, { FunctionComponent, useContext } from "react";
import { Link } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";

import "./index.scss";
import GroupContext from "../../../context/GroupContext";

const APIDocs: FunctionComponent = () => {
  const [group] = useContext(GroupContext);

  if (!group) return null;

  const onComplete = (system: any) => {
    if (group.keys.length > 0) system.preauthorizeApiKey("apiKeyAuth", group.keys[0].token);
  };

  return (
    <section className="section">
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
        <SwaggerUI url={`${process.env.BACKEND_URL}/swagger.json`} onComplete={onComplete} />
      </div>
    </section>
  );
};

export default APIDocs;
