import { Form, Formik } from "formik";
import React, { FunctionComponent, useState } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";

import startPasswordReset from "../../api/account/startPasswordReset";
import mapErrors from "../../api/mapErrors";
import InputField from "../forms/InputField";
// Take "t" from query params and POST it with the new password
// For when the user has forgotten their password and wants to reset it.
const PasswordReset: FunctionComponent = () => {
// The form
  const [done, setDone] = useState<string|undefined>();
  if (done) {
    return (
      <div className="section">

        <div className="notification is-success">
          <h1 className="title">Password reset sent</h1>
          <p>If there is an account associated with {done} we will send an email with password reset instructions.</p>
        </div>
        <p className="has-text-centered">Please check your email. You can close this tab.</p>

      </div>
    );
  }
  return (
    <div className="section">
      <h1 className="title">Reset your password</h1>
      <p>Please provide the email associated with your account. We will email you instructions on how to reset your password.</p>
      <Link to="/login">Return to login</Link>
      <Formik
        initialValues={{ email: "" }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Must be a valid email")
            .required("We can't reset your password without an email!")
        })}
        onSubmit={async (values, { setErrors, setFieldError }) => {
          try {
            await startPasswordReset(values.email);
            setDone(values.email);
          } catch (err) {
            if (err.response) {
              const error = await err.response.json();
              if (error.errors) {
                const mapped = mapErrors(error.errors);
                setErrors(mapped);
              } else {
                setFieldError("email", error.message);
              }
              return;
            }
            throw new Error(err);
          }
        }}>

        {({ isSubmitting }) => (
          <Form>
            <InputField label="Email address" type="email" name="email" placeholder="The email address on your account" />
            <button className={`button is-primary ${isSubmitting ? "is-loading" : ""}`} type="submit">Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PasswordReset;
