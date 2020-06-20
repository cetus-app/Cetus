// Created by josh on 07/06/2020
import React, { FunctionComponent } from "react";

import GroupInfo from "./GroupInfo";
import TokenMgr from "./TokenManager";

interface GroupHomeProps {

}

const GroupHome: FunctionComponent<GroupHomeProps> = props => (
  <div>
    <GroupInfo />
    <h2 className="subtitle">Using your group</h2>
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
    <TokenMgr />


  </div>
);
export default GroupHome;
