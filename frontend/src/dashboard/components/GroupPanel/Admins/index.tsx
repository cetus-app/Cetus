import React, { FunctionComponent, useContext, useState } from "react";

import { FullGroup } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import AddAdminModal from "./AddAdminModal";
import AdminBox from "./AdminBox";


interface GroupAdminsProps{
  isOwner: boolean
}

const GroupAdmins: FunctionComponent<GroupAdminsProps> = ({ isOwner }) => {
  const [group, setGroup] = useContext(GroupContext);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  if (!group) {
    return <p>Loading...</p>;
  }

  function handleAddAdmin (grp?: FullGroup): any {
    if (!grp) return setModalOpen(false);
    return setGroup(grp);
  }

  return (
    <div>
      { modalOpen ? <AddAdminModal handleDone={handleAddAdmin} groupId={group.id} /> : ""}
      <div className="level mt-2">
        <div className="level-left">
          <div className="level-item">
            <h1 className="title">Admins</h1>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button className="button is-primary" type="button" onClick={() => setModalOpen(true)}>Add admin</button>
          </div>
        </div>
      </div>

      <p>Group admins can access your group regardless of whether they are in your group on Roblox. A user must sign up to our
        service before you can add them here. This is useful so that you can add developers etc.
      </p>
      <p>Admins can access your <strong>tokens</strong> and integrations.
        They cannot modify billing, unlink your group or add more admins.
      </p>
      <p>{ isOwner ? "You are the group owner." : "You are an admin." } </p>
      <div className="columns mt-1 is-multiline is-tablet">
        {
          group.admins.length !== 0 ? group.admins.map(admin => <AdminBox user={admin.robloxInfo} handleClick={console.log} key={admin.id} />) : "There are no admins."
        }
      </div>

    </div>
  );
};
export default GroupAdmins;
