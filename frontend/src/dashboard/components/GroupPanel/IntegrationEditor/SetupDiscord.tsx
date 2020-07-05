import React, {
  Fragment, FunctionComponent, useContext, useState
} from "react";

import { ApiKey, DiscordBotConfig } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import ApiKeyPicker from "../../shared/ApiKeyPicker";

interface SetupDiscordProps {
  config: DiscordBotConfig;
}

const SetupDiscord: FunctionComponent<SetupDiscordProps> = ({ config: { guildId } }) => {
  const [dropdownActive, setDropdownActive] = useState(false);
  const [selected, setSelected] = useState<ApiKey | null>(null);
  const [group] = useContext(GroupContext);

  if (!group) return null;

  const handleKeyClick = (id: string): void => {
    const key = group.keys.find(k => k.id === id);
    if (!key) return;

    setSelected(key);
    setDropdownActive(false);
  };

  return (
    <div className="setup-discord-integration">
      {guildId && <h5>The Cetus Discord bot is currently configured for guild ID {guildId}</h5>}
      {guildId && <p>Choose a different API key in the menu below to reconfigure Cetus</p>}
      {!guildId
        && <h5>The Cetus Discord bot is currently not configured for your group. Choose an API key in the menu below and get started!</h5>}
      <ApiKeyPicker
        isActive={dropdownActive}
        onToggle={() => setDropdownActive(!dropdownActive)}
        selectedName={selected?.name}
        apiKeys={group.keys}
        onKeyClick={(_e, id) => handleKeyClick(id)} />
      {selected && (
        <Fragment>
          <br />
          <br />
          <p>
            Clicking the button below will redirect you to Discord.
            Discord will ask you to choose a guild to add Cetus to and authenticate your account.
            After you authorize, Cetus will be configured and ready to use in your server!
            It is also possible to use the button below to reconfigure Cetus to use a different API key for your group;
            just choose your API key and click the button!
          </p>
          <a href={`${process.env.BACKEND_URL}/auth/discord?groupKey=${encodeURIComponent(selected.token)}`} className="button is-info" type="button">Configure and add Cetus to your server</a>
        </Fragment>
      )}
    </div>
  );
};

export default SetupDiscord;
