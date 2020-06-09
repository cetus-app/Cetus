// Created by josh on 07/06/2020
import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
interface SideBarProps{

}

export const SideBar: FunctionComponent<SideBarProps> = props => (
  <div className="sidebar">

    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li><a>Information</a></li>
        <li><a>Lua SDK</a></li>
        <li><a>API Docs</a></li>
        <li>
          <a className="is-active">Manage Integrations</a>
          <ul>
            <li><a>Enabled integrations</a></li>
            <li><a>Add an integration</a></li>
          </ul>
        </li>
      </ul>
      <p className="menu-label">Manage</p>
      <ul className="menu-list">
        <li><a>Billing</a></li>
        <li><a>Unlink</a></li>
        <li><a>Get help</a></li>
      </ul>
    </aside>
  </div>
);
export default SideBar;
