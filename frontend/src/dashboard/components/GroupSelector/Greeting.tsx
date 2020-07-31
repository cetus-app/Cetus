import React, { FunctionComponent, useEffect, useState } from "react";

import { getRoblox } from "../../api/account";
import { PartialUser, RobloxUser } from "../../api/types";



export const Greeting: FunctionComponent = () => {
  const [robloxInfo, setRoblox] = useState<undefined | RobloxUser>();
  useEffect(() => {
    (async function f () {
      const rbx = await getRoblox();
      if (rbx.id) {
        setRoblox(rbx);
      }
    }());
  }, []);
  const time = new Date().getHours() + 1;
  let greetingStr = "Hello, ";
  if (time < 12) {
    greetingStr = "Morning";
  } else if (time > 12 && time < 18) {
    greetingStr = "Afternoon";
  } else {
    greetingStr = "Evening";
  }
  greetingStr = `${greetingStr}, ${robloxInfo ? robloxInfo.username : ""}!`;
  if (robloxInfo) {
    return (
      <div className="columns is-mobile is-vcentered greeting">
        <div className="column is-offset-1 is-1">
          <div className="user-image">
            <img src={robloxInfo.image} alt={robloxInfo.username} />
          </div>
        </div>
        <div className="column">
          <h2 className="title is-4">{greetingStr}</h2>
        </div>
      </div>
    );
  }
  return <h2 className="title is-4">{greetingStr}</h2>;
};
