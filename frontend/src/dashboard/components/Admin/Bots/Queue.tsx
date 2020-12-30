import React, { FunctionComponent, useEffect, useState } from "react";

import "./Queue.scss";
import { markBotActive } from "../../../api";
import { queue as getQueue } from "../../../api/bots";
import { QueueItem as QueueItemType } from "../../../api/types/Bot";
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

  const handleMarkActive = async (groupId: string) => {
    await markBotActive(groupId);

    setQueue(prev => {
      if (prev) {
        const newQueue = prev.slice();
        const index = newQueue.findIndex(i => i.group.id === groupId);

        if (index >= 0) {
          newQueue.splice(index, 1);
          return newQueue;
        }
      }

      return prev;
    });
  };

  return (
    <section className="section columns is-centered bot-queue">
      <div className="column is-10">
        <h1 className="title">Bot queue (inactive bots)</h1>
        <p>This queue contains groups which have a bot assigned, but it has not yet been deployed or is no longer in it.</p>

        <div className="columns is-multiline mt-2">
          {queue.map(item => (
            <div key={item.group.id} className="column is-6 is-one-third-desktop is-3-widescreen">
              <QueueItem item={item} onMarkActive={() => handleMarkActive(item.group.id)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BotQueue;
