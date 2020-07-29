//

import React, { FunctionComponent } from "react";

import { Click } from "../../types";

interface Props {
  handleCancel: Function
  handleDelete: Click<HTMLButtonElement>
}


const DeleteAccountModal: FunctionComponent<Props> = ({ handleCancel, handleDelete }) => (
  <div className="modal is-active">
    <div className="modal-background" />
    <div className="modal-card">
      <header className="modal-card-head has-background-danger">
        <p className="modal-card-title has-text-white">Are you sure you want to delete your account?</p>
        <button className="delete" aria-label="close" type="button" />
      </header>
      <section className="modal-card-body">
        <p>- <strong>This action cannot be reversed</strong>. If you&apos;ve finished with our service,
          we suggest you instead keep your account in-case you want to add another group in future.
        </p>
        <p>- As per our Privacy Policy, once you delete your account all associated data will be removed from our servers
          - this includes all groups you have added.
        </p>
        <p>When you delete your account, we will cease all billing connected to your account and groups.</p>
        <br />
        <p>Having problems? Why not <a href={process.env.discordInvite}>Get in touch</a> instead? We&apos;re happy to help :)</p>
      </section>
      <footer className="modal-card-foot">
        <button className="button is-danger" type="button" onClick={handleDelete}>Delete account</button>
        <button className="button" type="button" onClick={() => handleCancel(false)}>Cancel</button>
      </footer>
    </div>
  </div>
);

export default DeleteAccountModal;
