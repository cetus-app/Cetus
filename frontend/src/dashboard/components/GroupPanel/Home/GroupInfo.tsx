// Created by josh on 07/06/2020
import React, { FunctionComponent, useContext } from "react";

import GroupContext from "../../../context/GroupContext";
import BotStatus from "./BotStatus";

interface GroupInfoProps {

}

const GroupInfo: FunctionComponent<GroupInfoProps> = () => {
  const [group, setGroup] = useContext(GroupContext);
  if (group) {
    const { robloxInfo } = group;
    console.log(robloxInfo);
    return (
      <div className="columns is-mobile group-info">
        <div className="column is-2">
          <div className="image is-square">
            <img src={group.robloxInfo ? group?.robloxInfo.emblemUrl : ""} alt="Group icon" className="group-img" />
          </div>
        </div>
        <div className="column">
          <h1 className="title">{robloxInfo ? group.robloxInfo.name : group.id}</h1>
          <h2 className="subtitle">Group id: {robloxInfo ? robloxInfo.id : group.id}</h2>
          <p className="ownertext">Group owner: <a rel="noopener" target="noreferrer" href={`https://roblox.com/users/${robloxInfo ? robloxInfo.owner.id : group.owner.robloxId}/profile`}>{robloxInfo ? robloxInfo.owner.name : "You"}</a></p>
          <BotStatus group={group} setGroup={setGroup} />

        </div>
      </div>
    );
  }
  return <p className="has-text-centered has-text-grey">Loading group info</p>;
};
export default GroupInfo;
