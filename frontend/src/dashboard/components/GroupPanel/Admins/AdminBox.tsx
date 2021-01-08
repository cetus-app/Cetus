// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";

import { RobloxUser } from "../../../api/types";
import AdminMedia from "./AdminMedia";


interface AdminBoxProps {
  user: RobloxUser,
  handleClick: Function,
}

const AdminBox: FunctionComponent<AdminBoxProps> = ({ user }) => (
  <div className="column is-3 is-half-mobile is-offset-one-quarter-mobile">
    <div className="card">
      <div className="card-content" style={{ padding: "1rem" }}>
        <AdminMedia user={user} />
      </div>
      <footer className="card-footer">
        <a href="#" className="card-footer-item">Remove</a>
      </footer>
    </div>
  </div>
);
export default AdminBox;
