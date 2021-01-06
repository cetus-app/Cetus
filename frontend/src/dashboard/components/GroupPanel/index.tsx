// Allows Groups to be edited and contains all group editor related stuff
import React, {
  FunctionComponent, useContext, useEffect, useState
} from "react";
import {
  Redirect, Route, Switch, useParams, useRouteMatch
} from "react-router-dom";

import { getGroup } from "../../api/groups";
import { FullGroup } from "../../api/types";
import { GroupProvider } from "../../context/GroupContext";
import "../../assets/scss/GroupPanel.scss";
import UserContext from "../../context/UserContext";
import { Billing } from "../Billing";
import { NoMatch } from "../NoMatch";
import EmailNotification from "../shared/EmailNotification";
import ForbiddenError from "../shared/ForbiddenError";
import APIDocs from "./APIDocs";
import GroupAdmins from "./Admins";
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
  const user = useContext(UserContext);
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
  const isOwner = group && user && user.id === group.owner.id;
  return (
    <GroupProvider value={[group, setGroup]}>
      <div className="columns">
        <div className="column is-one-fifth sidebar-container">
          <SideBar isOwner={!!isOwner} />
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

            <Route path={`${path}/admins`}>
              <GroupAdmins isOwner={!!isOwner} />
            </Route>
            <Route path={`${path}/billing`}>
              { isOwner ? <Billing /> : <ForbiddenError message="Only the group owner can change billing settings." />}
            </Route>
            <Route path={`${path}/integrations`} exact>
              <Integrations />
            </Route>
            <Route path={`${path}/integrations/:integrationId`}>
              <IntegrationEditor />
            </Route>
            <Route path={`${path}/unlink`}>
              { isOwner ? <Unlink /> : <ForbiddenError message="Only the group owner can unlink the group." />}
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
