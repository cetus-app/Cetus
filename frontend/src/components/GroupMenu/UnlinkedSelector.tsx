import React, {
  Fragment, FunctionComponent, useEffect, useState
} from "react";

import { getUnlinkedGroups } from "../../api/groups";
import { UnlinkedGroup } from "../../api/types";
import GroupButton from "./GroupButton";

interface GroupSelectorProps {
  handleSelected: Function
}


const UnlinkedSelector: FunctionComponent<GroupSelectorProps> = ({ handleSelected }) => {
  const [groups, setGroups] = useState<undefined |UnlinkedGroup[]>();

  useEffect(() => {
    if (!groups) {
      (async function fetchGroups () {
        const groupResp = await getUnlinkedGroups();
        if (Array.isArray(groupResp)) {
          setGroups(groupResp);
        }
      }());
    }
  });
  if (groups) {
    return (
      <Fragment>
        {
          groups.length === 0
            ? "There are no suitable groups - You can only add groups you own."
            : groups.map(g => (
              <GroupButton
                imgUrl={g.emblemUrl ? g.emblemUrl : "https://jdrf.org.uk/wp-content/uploads/2017/06/placeholder-image.jpg"}
                groupName={g.name ? g.name : `${g.id}`}
                handleClick={() => handleSelected(g.id)} />
            ))
        }


      </Fragment>
    );
  }
  return (
    <div className="has-text-centered has-text-grey">
      Loading unlinked groups...
    </div>
  );
};
export default UnlinkedSelector;
