import React, { FunctionComponent, useContext } from "react";
import {
  BrowserRouter, Redirect, Route, Switch, useParams
} from "react-router-dom";

import UserContext from "../context/UserContext";
import Admin from "./Admin/Admin";
import BotQueue from "./Admin/BotQueue";
import GroupMenu from "./GroupMenu";
import GroupSelector from "./GroupMenu/GroupSelector";
import UnlinkedSelector from "./GroupMenu/UnlinkedSelector";
import GroupPanel from "./GroupPanel";
import { NoMatch } from "./NoMatch";
import Verify from "./Verification/Verification";

const AuthenticatedApp: FunctionComponent = () => {
  const user = useContext(UserContext);
  if (!user) return <Redirect to="/signup" />;

  if (!user.robloxId) return <Verify />;
  return (
    <BrowserRouter basename="/dashboard">
      <Switch>
        <Route exact path="/">
          <div className="has-text-centered">{user.email}</div>
        </Route>
        <Route path="/groups" exact>
          <GroupMenu
            title="Linked groups"
            subtitle="Linked groups are groups which already have a bot deployed to them, and are ready to make use of group integrations.">
            <GroupSelector />
          </GroupMenu>
        </Route>

        <Route path="/groups/unlinked">
          <GroupMenu
            title="Available groups"
            subtitle="Below are all of the groups owned by you which we found on your profile. Click one to link it to our service. ">
            <UnlinkedSelector handleSelected={console.log} />
          </GroupMenu>
        </Route>

        <Route path="/groups/:groupId">
          <GroupPanel />
        </Route>

        <Route path="/admin" exact>
          <Admin />
        </Route>

        <Route path="/admin/bot-queue">
          <BotQueue />
        </Route>

        <Route path="*">
          <NoMatch />
        </Route>
      </Switch>

    </BrowserRouter>
  );
};

export default AuthenticatedApp;
const GroupId = () => {
  const { id } = useParams();
  return <h1>Group - {id}</h1>;
};
