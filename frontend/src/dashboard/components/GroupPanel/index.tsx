// Allows Groups to be edited and contains all group editor related stuff
import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Redirect, Route, Switch, useHistory, useParams, useRouteMatch
} from "react-router-dom";

import { getGroup } from "../../api/groups";
import { FullGroup } from "../../api/types";
import { GroupProvider } from "../../context/GroupContext";
import "../../assets/scss/GroupPanel.scss";
import { Billing } from "../Billing";
import { NoMatch } from "../NoMatch";
import EmailNotification from "../shared/EmailNotification";
import APIDocs from "./APIDocs";
import GroupHome from "./Home";
import IntegrationEditor from "./IntegrationEditor";
import Integrations from "./IntegrationSelector";
import SDKDocs from "./SDKDocs";
import SideBar from "./Sidebar";
import Unlink from "./Unlink";

interface GroupPanelProps {

}

const GroupPanel: FunctionComponent<GroupPanelProps> = _props => {
  const { groupId } = useParams();
  const { path } = useRouteMatch();
  const [group, setGroup] = useState<FullGroup|null>(null);
  const [error, setError] = useState<string|undefined>();

  useEffect(() => {
    (async function getGroupInfo () {
      try {
        const groupInfo = await getGroup(groupId);
        setGroup(groupInfo);
      } catch (e) {
        // do something
        if ("response" in e) {
          const resp = await e.response.json();
          setError(resp.message);
        } else {
          throw new Error(e);
        }
      }
    }());
  }, [groupId]);
  if (error) {
    if (error === "Group not found") {
      return <Redirect to="/groups" />;
    }
    return <p className="has-text-danger">{error}</p>;
  }
  return (
    <GroupProvider value={[group, setGroup]}>
      <div className="columns">
        <div className="column is-one-fifth sidebar-container">
          <SideBar />
        </div>
        <div className="panel-right-column column">
          <EmailNotification />
          <Switch>
            <Route path={path} exact>
              <GroupHome />
            </Route>
            <Route path={`${path}/api`}>
              <APIDocs />
            </Route>
            <Route path={`${path}/lua`}>
              <SDKDocs />
            </Route>
            <Route path={`${path}/billing`}>
              <Billing />
            </Route>
            <Route path={`${path}/integrations`} exact>
              <Integrations />
            </Route>
            <Route path={`${path}/integrations/:integrationId`}>
              <IntegrationEditor />
            </Route>
            <Route path={`${path}/unlink`}>
              <Unlink />
            </Route>
            <Route path={path}>
              <NoMatch />
            </Route>
          </Switch>

        </div>
      </div>
    </GroupProvider>
  );
};
export default GroupPanel;
