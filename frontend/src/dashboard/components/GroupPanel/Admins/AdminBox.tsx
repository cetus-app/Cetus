// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";

import { RobloxUser } from "../../../api/types";
import { Click } from "../../../types";
import AdminMedia from "./AdminMedia";


interface AdminBoxProps {
  user: RobloxUser,
  handleClick: Click<HTMLAnchorElement>,
}

const AdminBox: FunctionComponent<AdminBoxProps> = ({ user, handleClick }) => (
  <div className="column is-3 is-half-mobile is-offset-one-quarter-mobile">
    <div className="card">
      <div className="card-content" style={{ padding: "0.75rem" }}>
        <AdminMedia user={user} />
      </div>
      <footer className="card-footer">
        <a className="card-footer-item " onClick={handleClick}>Remove</a>
      </footer>
    </div>
  </div>
);
export default AdminBox;
