// Created by josh on 07/06/2020
import React, { FunctionComponent, useContext } from "react";

import GroupContext from "../../../context/GroupContext";


const LimitDisplay: FunctionComponent = () => {
  const [group] = useContext(GroupContext);
  if (!group) {
    return <p>Loading...</p>;
  }
  if (group.stripeSubscriptionId || !group.actionLimit) {
    return (
      <div>
        <h2 className="subtitle is-4 mb-2">Requests made this month</h2>
        <p>Your integrations and applications which use our group API have made <code>{group.actionCount}</code>
          changes (Rank changes, shouts, exiles) to your group this month.
        </p>
        <p>
          <span className="icon has-text-gold"><i className="fas fa-crown ml-1 mr-1" /></span>
          Your group is pro - there is no limit to the number of actions you can make
          a month.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-2">
      <h2 className="subtitle is-4 mb-2">Requests remaining this month</h2>

      <p className="mb-1">You can make up to {group.actionLimit - group.actionCount} more requests which alter your group
        (E.g. Change rank, shout, exile) this month.
      </p>
      <div className="level mb-0">
        <div className="level-left">
          <div className="level-item">
            Requests made this month
          </div>
        </div>


        <div className="level-right">
          <div className="level-item">
            {group.actionCount} used of {group.actionLimit} limit
          </div>
        </div>
      </div>
      <progress className="progress is-primary mb-0" value={group.actionCount} max={group.actionLimit}>
        {Math.floor((group.actionCount / group.actionLimit) * 100)}%
      </progress>
    </div>
  );
};
export default LimitDisplay;
