// handles adding a group and redirecting to it
import React, {
  Fragment, FunctionComponent, useEffect, useState
} from "react";
import { Redirect } from "react-router-dom";

import { addGroup, getUnlinkedGroups } from "../../api/groups";
import { PartialGroup, UnlinkedGroup } from "../../api/types";
import GroupButton from "./GroupButton";


const UnlinkedSelector: FunctionComponent = () => {
  const [groups, setGroups] = useState<undefined |UnlinkedGroup[]>();
  const [redirect, setRedirect] = useState<undefined | PartialGroup["id"]>();
  const [error, setError] = useState<undefined | string>();

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

  async function handleAdd (robloxId: number) {
    try {
      const addedGroup = await addGroup(robloxId);
      setRedirect(addedGroup.id);
    } catch (e) {
      if ("response" in e) {
        const err = await e.response.json();
        setError(`${err.name}: ${err.message}`);
      }
    }
  }
  if (error) {
    return <p className="has-text-centered has-text-danger">Oops! Something went wrong: {error}</p>;
  }
  if (redirect) {
    return <Redirect to={`/subscribe/${redirect}`} />;
  }
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
                handleClick={() => handleAdd(g.id)}
                enabled
                key={g.id} />
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
