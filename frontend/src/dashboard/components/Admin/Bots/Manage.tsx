import React, { FunctionComponent, useEffect, useState } from "react";

import { bots as getBots, updateBot } from "../../../api/bots";
import { Bot } from "../../../api/types/Bot";
import BotItem from "./BotItem";

const BotManagement: FunctionComponent = () => {
  const [bots, setBots] = useState<Map<string, Bot> | null>(null);
  const [cookies, setCookies] = useState<{ [id: string]: string }>({});

  const botsArr = bots && Array.from(bots.values());

  useEffect(() => {
    getBots().then(apiBots => {
      const map = new Map(apiBots.map(bot => [bot.id, bot]));
      return setBots(map);
    });
  }, []);

  const updateBotState = (bot: Bot): void => setBots(prev => {
    if (!prev) return null;

    const updated = new Map(prev);

    return updated.set(bot.id, bot);
  });

  const handleStatusUpdate = (id: string): void => {
    if (!bots) return;

    const existing = bots.get(id);
    if (!existing) return;

    updateBot(id, { dead: !existing.dead }).then(updateBotState);
  };

  const handleCookieChange = (id: string, e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;

    setCookies(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCookieSubmit = (id: string): void => {
    if (!bots) return;

    updateBot(id, { cookie: cookies[id] }).then(updateBotState);

    setCookies(prev => ({
      ...prev,
      [id]: ""
    }));
  };

  if (!bots || !botsArr) {
    return (
      <div className="has-text-centered has-text-gray">
        Loading bots..
      </div>
    );
  }

  return (
    <section className="section columns is-centered">
      <div className="content column is-10">
        <h1 className="title">Bot management</h1>

        <h3>Bots</h3>
        <div className="columns is-multiline">
          {botsArr.map(bot => (
            <div key={bot.id} className="column is-6 is-one-third-desktop is-3-widescreen">
              <BotItem bot={bot} onStatusUpdate={handleStatusUpdate} cookie={cookies[bot.id] || ""} onCookieChange={handleCookieChange} onCookieSubmit={handleCookieSubmit} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BotManagement;
