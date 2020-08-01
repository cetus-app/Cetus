import React, { FunctionComponent, useContext } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import UserContext from "../context/UserContext";
import Account from "./Account";
import Admin from "./Admin/Admin";
import BotManagement from "./Admin/Bots/Manage";
import BotQueue from "./Admin/Bots/Queue";
import GroupPanel from "./GroupPanel";
import GroupSelector from "./GroupSelector";
import { Greeting } from "./GroupSelector/Greeting";
import GroupMenu from "./GroupSelector/GroupMenu";
import UnlinkedSelector from "./GroupSelector/UnlinkedSelector";
import { NoMatch } from "./NoMatch";
import Subscribe from "./Subscribe";
import Verify from "./Verification/Verification";

const AuthenticatedApp: FunctionComponent = () => {
  const user = useContext(UserContext);
  if (!user) return <Redirect to="/signup" />;

  if (!user.robloxId) return <Verify />;
  return (
    <Switch>
      {/* Redirects from signin/signup pages. */}
      <Redirect to="/" from="/login" />
      <Redirect to="/" from="/register" />
      <Route exact path="/">
        <Greeting />
        <GroupSelector
          title="Select a group"
          subtitle="Linked groups are groups which already have a bot deployed to them, and are ready to make use of group integrations.">
          <GroupMenu />
        </GroupSelector>
      </Route>

      <Route path="/unlinked" exact>
        <Greeting />
        <GroupSelector
          title="Available groups"
          subtitle="Below are all of the groups owned by you which we found on your profile. Click one to link it to our service. ">
          <UnlinkedSelector />
        </GroupSelector>
      </Route>

      <Route path="/account">
        <Account />
      </Route>

      <Route path="/subscribe/:groupId">
        <Subscribe />
      </Route>

      <Route path="/admin" exact>
        <Admin />
      </Route>

      <Route path="/admin/bots/manage">
        <BotManagement />
      </Route>

      <Route path="/admin/bots/queue">
        <BotQueue />
      </Route>

      <Route exact path="/reset">
        <p className="has-text-centered has-text-danger">You cannot reset a password while logged in.</p>
      </Route>
      <Route exact path="/finish-reset">
        <p className="has-text-centered has-text-danger">You cannot reset a password while logged in.</p>
      </Route>

      <Route path="/groups/:groupId">
        <GroupPanel />
      </Route>

      <Route path="*">
        <NoMatch />
      </Route>
    </Switch>
  );
};

export default AuthenticatedApp;
