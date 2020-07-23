import React, { FunctionComponent } from "react";

import { FullGroup } from "../../../../api/types";

interface BotViewerProps {
  group: FullGroup
}

export const BotViewer: FunctionComponent<BotViewerProps> = ({ group: { bot, botActive } }) => (!bot ? null : (
  <div className="bot-viewer">
    <div className="media">
      <figure className="media-left">
        <p className="image is-64x64">
          <img src={`https://verify.nezto.re/api/roblox/${bot.robloxId}/image`} alt={bot.username} />
        </p>
      </figure>
      <div className="media-content">
        <div className="columns">
          <div className="column is-3">
            <h2 className="is-size-5">{bot.username}</h2>
            <p>Id: {bot.robloxId}</p>
          </div>
          <div className="column">
            {
              botActive
                ? ""
                : (
                  <div className="notification is-danger is-light">
                    <i className="fas fa-exclamation" /> The bot is not ranked in your Group.
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </div>
  </div>

));
export default BotViewer;
