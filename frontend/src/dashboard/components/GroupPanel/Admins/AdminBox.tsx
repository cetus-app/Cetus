// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";

import { RobloxUser } from "../../../api/types";


interface AdminBoxProps {
  user: RobloxUser,
  handleClick: Function,
}

const AdminBox: FunctionComponent<AdminBoxProps> = ({ user, handleClick }) => (
  <div className="column is-3 is-half-mobile is-offset-one-quarter-mobile">
    <div className="card">
      <div className="card-content" style={{ padding: "1rem" }}>
        <div className="media">
          <div className="media-left">
            <figure className="image is-48x48">
              <img src={user.image} alt="User icon" />
            </figure>
          </div>
          <div className="media-content">
            <p className="title is-4">{user.username || "Username"}</p>
            <p className="subtitle is-6">{user.id}</p>
          </div>
        </div>

      </div>
      <footer className="card-footer">
        <a href="#" className="card-footer-item">Remove</a>
      </footer>
    </div>
  </div>
);
export default AdminBox;
