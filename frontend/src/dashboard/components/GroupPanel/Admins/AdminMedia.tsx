// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";

import { RobloxUser } from "../../../api/types";


interface AdminMediaProps {
  user: RobloxUser
}

const AdminMedia: FunctionComponent<AdminMediaProps> = ({ user }) => (
  <div className="media">
    <div className="media-left">
      <figure className="image is-48x48">
        <img src={user.image} alt="User icon" />
      </figure>
    </div>
    <div className="media-content">
      <p className="title is-5">{user.username || "Username"}</p>
      <p className="subtitle is-6">{user.id}</p>
    </div>
  </div>
);
export default AdminMedia;
