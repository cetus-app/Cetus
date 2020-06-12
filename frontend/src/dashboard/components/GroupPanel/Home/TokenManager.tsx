// Created by josh on 11/06/2020
import React, { FunctionComponent, useContext, useState } from "react";

import { deleteKey } from "../../../api/keys";
import { ApiKey, FullGroup } from "../../../api/types";
import GroupContext from "../../../context/GroupContext";
import { ButtonClick } from "../../../types";
import AddForm from "./AddTokenForm";

interface TokenManagerProps {

}

export const TokenManager: FunctionComponent<TokenManagerProps> = props => {
  const [group, setGroup] = useContext(GroupContext);
  const [addShown, setShown] = useState<boolean>(false);
  const [error, setError] = useState<string|undefined>();

  function handleKeyAdd (newKey: ApiKey) {
    const newG: Partial<FullGroup> = { ...group };
    if (!newG.keys) {
      newG.keys = [];
    }
    newG.keys.push(newKey);
    setGroup(newG);
    setShown(false);
  }
  async function handleDeleteKey (keyId: ApiKey["id"]) {
    // not physically possible
    if (!group) return;
    try {
      await deleteKey(keyId);
      // Remove it from the list
      if (!group.keys) {
        throw new Error("No keys on group context??");
      }
      const newG = { ...group };
      for (let i = 0; i < newG.keys.length; i++) {
        if (newG.keys[i].id === keyId) {
          newG.keys.splice(i, 1);
          break;
        }
      }
      setGroup(newG);
    } catch (e) {
      if (e.response) {
        const err = await e.response.json();
        setError(`${err.error.status}: ${err.error.message}`);
        return;
      }
      throw new Error(e);
    }
  }

  if (!group) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p className="has-text-danger">{error}</p>;
  }
  return (
    <div className="token-manager">

      <div className="columns">
        <div className="column is-10">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h2 className="subtitle">Authentication tokens</h2>
              </div>
            </div>

            <div className="level-right">
              <div className="level-item">
                <button type="button" className="button is-primary" onClick={() => setShown(true)}>Add token</button>
              </div>
            </div>
          </div>
          {addShown
            ? <AddForm handleKeyAdd={handleKeyAdd} groupId={group.id} /> : ""}
          <div>
            {
            group.keys.map((key: ApiKey) => (
              <TokenRow
                token={key}
                handleDelete={() => handleDeleteKey(key.id)}
                key={key.id} />
            ))
          }
          </div>

        </div>


      </div>
    </div>
  );
};
export default TokenManager;

interface TokenRowProps {
  token: ApiKey,
  handleDelete: ButtonClick,
}
const TokenRow = ({ token, handleDelete }: TokenRowProps) => {
  const [shown, setShown] = useState<boolean>(false);
  const toggle = () => setShown(!shown);
  const handleCopy = () => navigator.clipboard.writeText(token.token);

  return (
    <div className="box">
      <div className="columns">
        <div className="column is-2 clickable" onClick={toggle} role="button" key={token.id} onKeyPress={toggle} tabIndex={0}>
          <p className="subtitle">{token.name}</p>
        </div>
        <div className="column is-7">
          <div className="wrap">
            {
            shown
              ? token.token
              : <small className="clickable is-fullwidth" onClick={toggle} role="button" key={token.id} onKeyPress={toggle} tabIndex={-1}>Click to show token</small>
          }
          </div>

        </div>

        <div className="column is-3">
          <div>
            <div className="field is-grouped is-pulled-right">
              <p className="control">
                <button type="button" className="button" onClick={handleCopy}>Copy</button>
              </p>
              <p className="control">
                <button type="button" className="button is-danger" onClick={handleDelete}>Delete</button>
              </p>
            </div>
          </div>
          {/* Hacky but doesn't affect desktop - just fixes client (buttons escaping their container) */}
          <br />


        </div>
      </div>
    </div>
  );
};


/*
const TokenRow = ({
  token, isShown, handleDelete, handleClick
}: TokenRowProps) => (
  <div className="box" role="button" tabIndex={0} onKeyPress={() => handleClick()} onClick={() => handleClick()} key={token.id}>
    <div className="level">
      <div className="level-left">
        <div className="level-item">
          <p className="subtitle">{token.name}</p>
        </div>
      </div>
      <div className="level-item">
        <p className="wrap">
          {
            isShown
              ? token.token
              : <small>Click to show token</small>
          }
        </p>

      </div>
      <div className="level-right">
        <div className="level-item">
          <button type="button" className="button is-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  </div>
);
*/
