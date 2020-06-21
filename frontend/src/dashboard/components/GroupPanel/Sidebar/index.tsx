// Created by josh on 07/06/2020
import React, { FunctionComponent } from "react";
import { NavLink, useRouteMatch } from "react-router-dom";


interface SideBarProps{

}

const SideBar: FunctionComponent<SideBarProps> = props => {
  const { url } = useRouteMatch();
  return (
    <div className="sidebar">

      <aside className="menu">
        <p className="menu-label">General</p>
        <ul className="menu-list">
          <li><NavLink to={`${url}`} activeClassName="is-active" exact>Information</NavLink></li>
          <li><NavLink to={`${url}/lua`} activeClassName="is-active">Lua SDK</NavLink></li>
          <li><NavLink to={`${url}/api`} activeClassName="is-active">API Docs</NavLink></li>
          <li><NavLink to={`${url}/integrations`} activeClassName="is-active">Integrations</NavLink></li>
        </ul>
        <p className="menu-label">Manage</p>
        <ul className="menu-list">
          <NavLink to={`${url}/billing`} activeClassName="is-active">Billing</NavLink>
          <NavLink to={`${url}/unlink`} activeClassName="is-active">Unlink</NavLink>
          <NavLink to={`${url}/help`} activeClassName="is-active">Get help</NavLink>
        </ul>
      </aside>
    </div>
  );
};
export default SideBar;
