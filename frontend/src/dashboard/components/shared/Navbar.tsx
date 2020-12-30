// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";


const cetusIcon = require("url:../../../static/assets/Cetus.png");


interface NavbarProps {
}

const Navbar: FunctionComponent<NavbarProps> = () => (
  <nav className="navbar panel-nav is-dark">
    <div className="navbar-brand">
      <a href="/" className="navbar-item">
        <img src={cetusIcon} alt="Logo" />
      </a>
    </div>
    <div className="navbar-menu">
      <div className="navbar-start">
        <Link className="navbar-item" to="/">Groups</Link>
      </div>
      <div className="navbar-end">
        <Link className="navbar-item" to="/account">My account</Link>
      </div>
    </div>
  </nav>
);
export default Navbar;
