import React, { FunctionComponent, useEffect, useState } from "react";

import "./BotQueue.scss";
import { queue as getQueue } from "../../api/bots";
import { QueueItem as QueueItemType } from "../../api/types/Bot";
import QueueItem from "./QueueItem";

const BotQueue: FunctionComponent = () => {
  const [queue, setQueue] = useState<QueueItemType[] | null>(null);

  useEffect(() => {
    getQueue().then(setQueue);
  }, []);

  if (!queue) {
    return (
      <div className="has-text-centered has-text-gray">
        Loading bot queue..
      </div>
    );
  }

  return (
    <section className="section columns is-centered bot-queue">
      <div className="column is-10">
        <h1 className="title">Bot queue (inactive bots)</h1>

        <div className="columns is-multiline">
          {queue?.map(item => (
            <div key={item.group.id} className="column is-6 is-one-third-desktop is-3-widescreen">
              <QueueItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BotQueue;
