import React, { FunctionComponent, useState } from "react";

import DeleteAccountModal from "./DeleteAccountModal";


const DeleteAccount: FunctionComponent = () => {
  const [modal, setModal] = useState<boolean>(false);
  function handleDeletion () {
    console.log("Deleting account. This action cannot be undone.");
  }

  if (modal) {
    return <DeleteAccountModal handleCancel={setModal} handleDelete={handleDeletion} />;
  }
  return (<button className="button is-danger" type="button" onClick={() => setModal(true)}>Delete account</button>);
};

export default DeleteAccount;
