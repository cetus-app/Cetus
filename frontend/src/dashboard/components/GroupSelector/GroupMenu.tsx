// Created by josh on 28/05/2020
import React, {
  Fragment, FunctionComponent, useEffect, useState
} from "react";
import { Redirect, useHistory } from "react-router-dom";

import { getGroups } from "../../api/groups";
import { PartialGroup } from "../../api/types";
import GroupButton from "./GroupButton";

interface GroupSelectorProps {
}


const GroupMenu: FunctionComponent<GroupSelectorProps> = () => {
  const [groups, setGroups] = useState<undefined |PartialGroup[]>();
  const [redirect, setRedirect] = useState<undefined | PartialGroup["id"]>();
  const { push } = useHistory();

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

  const handleClick = (group: PartialGroup) => {
    if (group.stripeSubscriptionId) {
      setRedirect(group.id);
    } else {
      push(`/subscribe/${group.id}`);
    }
  };

  if (redirect) {
    return <Redirect to={`groups/${redirect}`} />;
  }
  if (groups) {
    return (
      <Fragment>
        {
          groups.length === 0
            ? "There are no groups to show. Click the 'Add group' button to add one!"
            : groups.map(g => (
              <GroupButton
                imgUrl={g.robloxInfo ? g.robloxInfo.emblemUrl : "https://jdrf.org.uk/wp-content/uploads/2017/06/placeholder-image.jpg"}
                groupName={g.robloxInfo ? g.robloxInfo.name : `${g.robloxId}`}
                enabled={!!g.stripeSubscriptionId}
                handleClick={() => handleClick(g)}
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
export default GroupMenu;
