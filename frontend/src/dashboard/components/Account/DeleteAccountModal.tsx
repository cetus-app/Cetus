//


import { Form, Formik } from "formik";
import React, { FunctionComponent } from "react";
import * as Yup from "yup";

import { deleteAccount } from "../../api/account/delete";
import mapErrors from "../../api/mapErrors";
import InputField from "../forms/InputField";
import { PasswordValidation } from "../shared";

interface Props {
  handleCancel: Function
}


const DeleteAccountModal: FunctionComponent<Props> = ({ handleCancel }) => (

  <Formik
    initialValues={{ password: "" }}
    validationSchema={Yup.object({ password: PasswordValidation })}
    onSubmit={async (values, { setErrors, setFieldError }) => {
      console.log("Deleting account. This action cannot be undone.");
      try {
        await deleteAccount(values.password);
        // Return to home.
        window.location.href = "/";
      } catch (err) {
        if (err.response) {
          const error = await err.response.json();
          if (error.errors) {
            const mapped = mapErrors(error.errors);
            setErrors(mapped);
          } else {
            setFieldError("password", error.message);
          }
          return;
        }
        throw new Error(err);
      }
    }}>

    {({ isSubmitting }) => (
      <Form>
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
              <InputField label="Your password" type="password" name="password" placeholder="Please enter your password to confirm." />
            </section>
            <footer className="modal-card-foot">
              <button className={`button is-danger ${isSubmitting ? "is-loading" : ""}`} type="submit">Delete account</button>
              <button className={`button ${isSubmitting ? "is-loading" : ""}`} type="button" onClick={() => handleCancel(false)}>Cancel</button>
            </footer>
          </div>
        </div>
      </Form>
    )}
  </Formik>

);

export default DeleteAccountModal;
/*

      <
      <button className={`button is-primary ${isSubmitting ? "is-loading" : ""}`} type="submit">Change password</button>
    */
