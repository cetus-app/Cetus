// Allows Groups to be edited and contains all group editor related stuff
import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getGroup } from "../../api/groups";
import { FullGroup } from "../../api/types";
import { GroupProvider } from "../../context/GroupContext";
import "./GroupPanel.css";
import GroupHome from "./Home";
import SideBar from "./Sidebar";

interface GroupPanelProps {

}

const GroupPanel: FunctionComponent<GroupPanelProps> = _props => {
  const { groupId } = useParams();
  const [group, setGroup] = useState<FullGroup|null>(null);
  useEffect(() => {
    (async function getGroupInfo () {
      try {
        const groupInfo = await getGroup(groupId);
        setGroup(groupInfo);
      } catch (e) {
        // do something
      }
    }());
  }, [groupId]);
  return (
    <GroupProvider value={[group, setGroup]}>
      <div className="columns">
        <div className="column is-one-fifth ">
          <SideBar />
        </div>
        <div className="column panel-right-column">
          <GroupHome />
        </div>
      </div>
    </GroupProvider>
  );
};
export default GroupPanel;
