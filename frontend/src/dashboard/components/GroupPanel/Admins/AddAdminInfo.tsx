// Created by josh on 28/05/2020
import React, { FunctionComponent, Fragment } from "react";

import { RobloxUser } from "../../../api/types";
import AdminMedia from "./AdminMedia";


interface AddAdminInfoProps {
  user: RobloxUser
}

const AddAdminInfo: FunctionComponent<AddAdminInfoProps> = ({ user }) => (
  <Fragment>
    <small>If you continue, the following user will be added as an admin on your group:</small>
    <div className="add-admin-info">
      <AdminMedia user={user} />
    </div>
  </Fragment>
);
export default AddAdminInfo;
