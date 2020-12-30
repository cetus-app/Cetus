// Created by josh on 07/06/2020
import React, { FunctionComponent } from "react";

import GroupInfo from "./GroupInfo";
import LimitDisplay from "./LimitDisplay";
import TokenMgr from "./TokenManager";

interface GroupHomeProps {

}

const GroupHome: FunctionComponent<GroupHomeProps> = props => (
  <div>
    <GroupInfo />
    <h2 className="subtitle is-4">Using your group</h2>
    <div className="indented-text">
      There are lots of ways to get started interacting with your group. Why not:
      <div className="content">
        <ul>
          <li>
            Check out our premade integrations
          </li>
          <li>
            Read the documentation for our Lua SDK
          </li>
          <li>
            Read the API docs and roll your own integration
          </li>
        </ul>
      </div>
    </div>
    <div className="columns">
      <div className="column is-10">
        <hr />
        <LimitDisplay />
        <hr />
        <TokenMgr />
      </div>
    </div>

  </div>
);
export default GroupHome;
