import React, { FunctionComponent } from "react";

import { Bot } from "../../../api/types/Bot";

export interface BotProps {
  bot: Bot;
  onStatusUpdate (id: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void;
  cookie: string;
  onCookieChange (id: string, e: React.ChangeEvent<HTMLInputElement>): void;
  onCookieSubmit (id: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const BotItem: FunctionComponent<BotProps> = ({
  bot: {
    id, robloxId, username, cookieUpdated, dead
  }, onStatusUpdate, cookie, onCookieChange, onCookieSubmit
}) => (
  <div className="card">
    <div className="card-content">
      <div className="media">
        <div className="media-content">
          <p className="p title is-4">{username}</p>
          <p className="subtitle is-6">Roblox ID - {robloxId}</p>
        </div>
      </div>

      <div className="content">
        {/* TODO: better date format */}
        <p>The bot is marked as <b>{dead ? "dead" : "functioning"}</b>. Its cookie was last updated {new Date(cookieUpdated).toLocaleString()}.</p>

        <p>
          {
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          }Update status to <a href="#" onClick={e => onStatusUpdate(id, e)}>{dead ? "functioning" : "dead"}</a>
        </p>

        <div className="field has-addons">
          <div className="control">
            <input type="text" className="input" placeholder="New cookie" value={cookie} onChange={e => onCookieChange(id, e)} />
          </div>

          <div className="control">
            <button type="button" className="button is-primary" onClick={e => onCookieSubmit(id, e)}>Update</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BotItem;
