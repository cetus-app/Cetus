import React, { FunctionComponent } from "react";

import { QueueItem as QueueItemType } from "../../../api/types/Bot";


export interface QueueItemProps {
  item: QueueItemType;
  onMarkActive: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const QueueItem: FunctionComponent<QueueItemProps> = ({ item: { bot, group }, onMarkActive }) => (
  <div className="card bot-queue-item">
    <div className="card-image">
      <figure className="image is-96x96">
        <img src={group.robloxInfo.emblemUrl} alt="Group emblem" />
      </figure>
    </div>

    <div className="card-content">
      <div className="media">
        <div className="media-content">
          <p className="title is-4">
            <a href={`https://roblox.com/groups/${group.robloxId}/-`} target="_blank" rel="noreferrer">
              {group.robloxInfo.name}
            </a>
          </p>
          <p className="subtitle is-6">Bot - {bot.username || bot.id} {bot.dead && "- marked as \"dead\""}</p>
        </div>
      </div>

      <div className="content">
        The bot is currently <b>inactive</b> in the group (not a member of the group, or missing permissions).
        <br />
        <a href="https://example.com">Group link</a>
        <br />
        <br />
        {
        // Can't bother styling a button to look like an anchor tag
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        }Mark as <a href="#" onClick={onMarkActive}>active</a> and remove from the queue
      </div>
    </div>
  </div>
);

export default QueueItem;
