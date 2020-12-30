/*
{}
 */

// Created by josh on 07/06/2020
import React, { FunctionComponent, useState } from "react";

import { enableBot } from "../../../api/bots";
import { FullGroup } from "../../../api/types";
import { EnableBotResponse } from "../../../api/types/Bot";

interface BotStatusProps {
  group?: FullGroup,
  setGroup: Function
}

const BotStatus: FunctionComponent<BotStatusProps> = ({ group, setGroup }) => {
  if (!group) {
    return <p>Loading...</p>;
  }

  const [error, setError] = useState<string|undefined>();
  const [enabled, setEnabled] = useState<EnableBotResponse>();
  async function checkStatus () {
    if (!group) return;
    try {
      const res = await enableBot(group.id);
      setEnabled(res);
      const newGroup = { ...group };
      newGroup.botActive = true;
      setGroup(newGroup);
    } catch (e) {
      if (e.response) {
        const json = await e.response.json();
        setError(json.message);
      }
    }
  }
  if (enabled && group.bot) {
    const keys = Object.keys(enabled.permissions) as (keyof typeof enabled.permissions)[];
    const strings = [];
    for (const key of keys) {
      if (enabled.permissions[key] === true) {
        strings.push(<span key={key}>{key}, </span>);
      }
    }
    return (
      <div className="notification is-success is-link">
        <p><span className="is-size-5 has-text-weight-bold">Bot activated</span></p>
        <p>Bot name: {group.bot.username}</p>
        <p>Permissions: {strings}</p>
      </div>
    );
  }
  if (group.botActive && group.bot) {
    return (
      <div>
        Bot: <a href={`https://roblox.com/users/${group.bot.robloxId}/profile`} target="_blank" rel="noreferrer">{group.bot.username}</a> ({group.bot.robloxId})
      </div>
    );
  }
  if (!group.bot) {
    return (
      <div className="notification is-danger">
        <p><span className="is-size-5 has-text-weight-bold">Your group has no bot assigned!</span></p>
        <p>This indicates an error occurred when you added your group - Please contact us as soon as possible. </p>
      </div>
    );
  }
  return (
    <div className="notification is-warning">
      <p><span className="is-size-5 has-text-weight-bold">Your bot is not active!</span> Bot name: {group.bot ? group.bot.username || group.bot.robloxId : "No bot assigned"}</p>
      <p>We&apos;ve received your request and will deploy the bot within 24 hours.
        Please rank the bot <strong>{group.bot ? group.bot.username || group.bot.robloxId : "No bot assigned"}</strong>
      </p>
      <p>The bot must be able to change ranks and read audit logs. Other permissions are optional.</p>
      <p>Once the bot is ranked, you can activate it below.</p>
      <div className="buttons">
        <button className="button is-small is-primary" type="button" onClick={checkStatus}>Activate bot</button>
        <a className="button is-info is-small" href={process.env.discordInvite}>Contact us</a>
      </div>
      {error ? <span className="has-text-danger">{error}</span> : ""}
    </div>
  );
};
export default BotStatus;
