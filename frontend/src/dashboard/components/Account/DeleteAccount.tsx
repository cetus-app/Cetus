import React, { FunctionComponent, useState } from "react";

import DeleteAccountModal from "./DeleteAccountModal";


const DeleteAccount: FunctionComponent = () => {
  const [modal, setModal] = useState<boolean>(false);
  if (modal) {
    return <DeleteAccountModal handleCancel={setModal} />;
  }
  return (<button className="button is-danger" type="button" onClick={() => setModal(true)}>Delete account</button>);
};

export default DeleteAccount;
