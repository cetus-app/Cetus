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
          <NavLink to={`${url}/`} activeClassName="is-active" exact>Information</NavLink>
          <NavLink to={`${url}/lua`} activeClassName="is-active">Lua SDK</NavLink>
          <NavLink to={`${url}/api`} activeClassName="is-active">API Docs</NavLink>
          <li>
            <NavLink to={`${url}/integrations`} activeClassName="is-active">Integrations</NavLink>
            <ul>
              <NavLink to={`${url}/integrations`} exact activeClassName="is-active">Integrations</NavLink>
              <NavLink to={`${url}/integrations/new`} activeClassName="is-active">Add an integration</NavLink>
            </ul>
          </li>
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
