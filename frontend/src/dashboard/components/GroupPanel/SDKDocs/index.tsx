// Created by josh on 07/06/2020
import React, { FunctionComponent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDocs } from "../../../api";
import { SchemaType } from "../../../api/types";
import SDKTitle from "./SDKTitle";
import Schema from "./schema";


interface SDKDocsProps {

}

const SDKDocs: FunctionComponent<SDKDocsProps> = () => {
  const [schemas, setSchemas] = useState<SchemaType|null>(null);
  useEffect(() => {
    (async function get () {
      const docs = await getDocs();
      setSchemas(docs.components.schemas);
    }());
    return undefined;
  }, []);
  return (
    <div className="sdk-docs section">
      <h1 className="title">SDK documentation</h1>
      <p>Our Lua <abbr title="Software Development Kit">SDK</abbr> allows you to interact with our API from within your Roblox game with ease:
        We take card of all the hard stuff to let you get to working on your content!
        We also provide a number of premade games which make use of this SDK and provide
        the perfect base to interact with our API.
      </p>
      <p>You can find the source code for our SDK here: <a href="https://github.com/cetus-app/cetus-rbx">Github repository</a>.
        If you need a hand using our SDK, <a href={process.env.discordInvite} target="_blank" rel="noreferrer">join our Discord</a>.
      </p>
      <SDKTitle text="1: Getting started" size={2} />
      <SDKTitle text="1.1: Installing the SDK" size={3} />
      <p>There are two main ways to get our SDK. You clone the Github repository and use Rojo
        (Either directly or through Git submodules), or you can download a prebuilt Roblox model
        from our Github releases page. We recommend downloading a prebuilt release if you are not too experienced.
      </p>
      <SDKTitle text="1.1.1: Using Rojo" size={4} />
      <p>Note: if you want to use <a href="https://rojo.space">Rojo</a> you must have it installed.</p>
      <p>To use it via. Rojo, navigate to your existing project directory and either:</p>
      <p><code>git clone https://github.com/cetus-app/cetus-rbx</code> or <code>git submodule add https://cetus-app/cetus-rbx</code></p>
      <p>If you do this within your code directory (usually <code>src</code>) you can get started right away!
        If not, you might need to add it as a source in your .project.json file.
      </p>

      <SDKTitle text="1.1.2: Using Github releases" size={4} />
      <p>Using our prebuilt models is far simpler but means that you will need to update manually.</p>
      <p>You can find these on
        our <a target="_blank" rel="noreferrer" href="https://github.com/cetus-app/cetus-rbx/releases">releases page</a>.
        Download the rbxmx file under Assets.
      </p>
      <p>In Studio, right click on where you want to insert the SDK and click &quot;Insert from file&quot;.
        Select the downloaded model, and you&apos;re ready to go!
      </p>
      <SDKTitle text="2: Using the SDK" size={2} />
      <div className="notification is-warning">
        We do not apply Roblox&apos;s filtering to any of the response strings.
        You must filter text before displaying it to users!
      </div>
      <p>When you require the SDK, you must pass an options table. You can find the available options below.</p>
      <p>You can get an API Key on the Group information tab.</p>
      <div className="schema-block">
        {"{"}
        <span className="line">token: <code>string</code></span>
        {"}"}
      </div>
      <p>Example usage:</p>
      <pre className="code">
        local cetus = require(path.to.cetus)({`{
          token = "My sekret token"
}`})
        -- Your code
        local group = cetus:getGroup()
      </pre>
      <p>Once you have required and configured the SDK, you can use it!
        This pattern, exporting a function, also means that you can have multiple SDK clients in the same script.
      </p>
      <SDKTitle text="2.1: Errors" size={3} />
      <p>Errors are returned with the following shape:</p>
      <pre className="code">
        {`{
  error = {
    status: number, -- The HTTP status code. 0 for a Roblox HTTP error
    name: string, -- The error name as returned by our API or "HttpError" for Roblox HTTP errors like ConnectFail.
    message: string -- A more indepth error message.
}
`}
      </pre>
      <p>Note: <code>message</code>is always returned unless it is an unauthorized error, in which case it may not be.</p>
      <p>Errors are not thrown using the Lua error function due to it&apos;s limitations, as it does not allow us to supply separate fields.</p>
      <SDKTitle text="3: SDK API" size={2} />
      <SDKTitle text="3.1: Methods" size={3} />
      <p>You must call all methods with a semicolon, like: <code>cetus:getGroup()</code>.</p>
      <p>Remember: If displaying the text output from any of these, you <strong>must</strong> filter the text first!</p>

      <SDKTitle text="exile" size={4} />
      <code>cetus:exile(userId: number)</code>
      <p>Exiles a user from your group. Requires the bot to have exile permission.</p>
      <p>Return value:</p>
      <Schema name="ExileUserResponse" schemas={schemas} />

      <SDKTitle text="getGroup" size={4} />
      <code>cetus:getGroup()</code>
      <p>Fetches your group information - This is the same output as what Roblox&apos;s `GroupService` provides. </p>
      <p>This method will cache for 20 minutes. If displaying content to users,
        either filter the response or just the id to fetch it via. GroupService. Example:
      </p>
      <pre className="code">
        {`local rawGroupInfo = cetus:getGroup()
if rawGroupInfo.error then
  -- Handle the error neatly, or:
  error(rawGroupInfo.error.message)
end
local groupInfo = GroupService:GetGroupInfoAsync(rawGroupInfo.id)
-- Use Group Info`}
      </pre>
      <p>This isn&apos;t wildly inefficient due to caching, and its a lot better than using filtering.</p>
      <p>Return value:</p>
      <Schema name="RobloxGroup" schemas={schemas} />

      <SDKTitle text="getRank" size={4} />
      <code>cetus:getRank(userId: number)</code>
      <p>Gets a user&apos;s group rank. Useful if the user is not ingame. You should use
        <code>Player:GetRankInGroup()</code> and <code>Player:GetRoleInGroup()</code> if possible.
      </p>
      <p>Return value:</p>
      <Schema name="GetRankResponse" schemas={schemas} />

      <SDKTitle text="setRank" size={4} />
      <code>cetus:setRank(userId: number, rank: number)</code>
      <p>Sets the user&apos;s rank in the group to the provided rank number. (1-254)
        Rank must be below the bot&apos;s
        rank and the bot must have permission to change ranks.
      </p>
      <Schema name="SetRankResponse" schemas={schemas} />

      <SDKTitle text="shout" size={4} />
      <code>cetus:exile(text: string)</code>
      <p>Sets the group shout.</p><p>Message is what the shout was set to. </p>
      <p>Return value:</p>
      <Schema name="SetShoutResponse" schemas={schemas} />

    </div>
  );
};
export default SDKDocs;
