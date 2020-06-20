// Allows Groups to be edited and contains all group editor related stuff
import React, { FunctionComponent, useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";

import { getGroup } from "../../api/groups";
import { FullGroup } from "../../api/types";
import { GroupProvider } from "../../context/GroupContext";
import "./GroupPanel.scss";
import GroupHome from "./Home";
import SideBar from "./Sidebar";

interface GroupPanelProps {

}

const GroupPanel: FunctionComponent<GroupPanelProps> = _props => {
  const { groupId } = useParams();
  const [group, setGroup] = useState<FullGroup|null>(null);
  const [error, setError] = useState<string|undefined>();

  useEffect(() => {
    (async function getGroupInfo () {
      try {
        const groupInfo = await getGroup(groupId);
        setGroup(groupInfo);
      } catch (e) {
        // do something
        if ("response" in e) {
          const resp = await e.response.json();
          setError(resp.message);
        } else {
          throw new Error(e);
        }
      }
    }());
  }, [groupId]);
  if (error) {
    if (error === "Group not found") {
      return <Redirect to="/groups" />;
    }
    return <p className="has-text-danger">{error}</p>;
  }
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
