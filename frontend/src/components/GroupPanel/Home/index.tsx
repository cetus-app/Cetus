// Created by josh on 07/06/2020
import React, { FunctionComponent } from "react";

import GroupInfo from "./GroupInfo";

interface GroupHomeProps {

}

export const GroupHome: FunctionComponent<GroupHomeProps> = props => (
  <div>
    <GroupInfo />
    <h2 className="subtitle">Using your group</h2>
    <p className="indented-text">
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
    </p>
    <div className="level">
      <div className="level-left">
        <div className="level-item">
          <h2 className="subtitle">Authentication tokens</h2>
        </div>
      </div>

      <div className="level-right">
        <div className="level-item">
          <button className="button is-primary">Add token</button>
        </div>
      </div>
    </div>


  </div>
);
export default GroupHome;
