// Created by josh on 28/05/2020
import React, {
  Fragment, FunctionComponent, useEffect, useState
} from "react";
import { Redirect, useRouteMatch } from "react-router-dom";

import { getGroups } from "../../api/groups";
import { PartialGroup } from "../../api/types";
import GroupButton from "./GroupButton";

interface GroupSelectorProps {
}


const GroupSelector: FunctionComponent<GroupSelectorProps> = () => {
  const [groups, setGroups] = useState<undefined |PartialGroup[]>();
  const [redirect, setRedirect] = useState<undefined | PartialGroup["id"]>();
  const match = useRouteMatch();

  useEffect(() => {
    if (!groups) {
      (async function fetchGroups () {
        const groupResp = await getGroups();
        if (Array.isArray(groupResp)) {
          setGroups(groupResp);
        }
      }());
    }
  });
  if (redirect) {
    return <Redirect to={`${match.url}/${redirect}`} />;
  }
  if (groups) {
    return (
      <Fragment>
        {
          groups.length === 0
            ? "There are no groups to show"
            : groups.map(g => (
              <GroupButton
                imgUrl={g.robloxInfo ? g.robloxInfo.emblemUrl : "https://jdrf.org.uk/wp-content/uploads/2017/06/placeholder-image.jpg"}
                groupName={g.robloxInfo ? g.robloxInfo.name : `${g.robloxId}`}
                handleClick={() => setRedirect(g.id)}
                key={g.id} />
            ))
      }


      </Fragment>
    );
  }
  return (
    <div className="has-text-centered has-text-grey">
      Loading groups...
    </div>
  );
};
export default GroupSelector;
