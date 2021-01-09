//


import React, { FunctionComponent, useState } from "react";

import { addAdmin } from "../../../api";
import { AdminInfo, FullGroup } from "../../../api/types";
import AddForm from "./AddAdminForm";
import AddAdminInfo from "./AddAdminInfo";

interface Props {
  handleDone: { (newGrp?: FullGroup): void }
  groupId: string
}

// If handleDone is passed a full group, a new admin was added. If it was passed undefined, it was cancelled.
const AddAdminModal: FunctionComponent<Props> = ({ handleDone, groupId }) => {
  const [adminInfo, setAdmin] = useState<AdminInfo|undefined>();
  const [errorMessage, setErrorMessage] = useState<string|undefined>();

  async function handleAddAdmin (id?: string) {
    if (!id) return undefined;
    try {
      const resp = await addAdmin(groupId, id);
      return handleDone(resp);
    } catch (err) {
      if (err.response) {
        const error = await err.response.json();
        return setErrorMessage(error.message);
      }
      throw new Error(err);
    }
  }

  return (
    <div className="modal is-active">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div className="modal-background" onClick={() => handleDone(undefined)} />
      <div className="modal-card">
        <header className="modal-card-head has-background-danger">
          <p className="modal-card-title has-text-white">Add new admin user</p>
          <button className="delete" aria-label="close" type="button" onClick={() => handleDone(undefined)} />
        </header>
        <section className="modal-card-body">
          <p><strong>This action is potentially destructive</strong>. This user will have full access to your
            group tokens and integrations.
          </p>
          <p>
            This means that they could do all of the actions your bot account can do -
            you should treat this as if you were ranking them to that rank, with some additional caution -
            it may difficult to detect unauthorised actions.
          </p>

          <AddForm isDisabled={!!adminInfo} handleInput={setAdmin} />

          { adminInfo ? <AddAdminInfo user={adminInfo.robloxInfo} /> : ""}
          { errorMessage ? <p className="has-text-danger">{errorMessage}</p> : "" }
        </section>
        <footer className="modal-card-foot">
          <button className="button is-primary" onClick={() => handleAddAdmin(adminInfo && adminInfo.id)} disabled={!adminInfo} type="submit">Add admin</button>
          <button className="button" type="button" onClick={() => handleDone(undefined)}>Cancel</button>
        </footer>
      </div>
    </div>
  );
};

export default AddAdminModal;
