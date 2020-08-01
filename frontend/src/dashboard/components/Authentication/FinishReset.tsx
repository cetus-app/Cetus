import { Form, Formik } from "formik";
import React, { FunctionComponent, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import * as Yup from "yup";

import finishPasswordReset from "../../api/account/finishPasswordReset";
import mapErrors from "../../api/mapErrors";
import InputField from "../forms/InputField";
import {PasswordValidation} from "../shared";
// Takes "t" from query params and POST it with the new password
// For when the user has forgotten their password and wants to reset it.
const FinishReset: FunctionComponent = () => {
  const urlSearch = new URLSearchParams(window.location.search);
  const token = urlSearch.get("t");

  // Redirect is used when the request is done and the user is being sent to login
  // InvalidToken is used if a request is made by the token and the server rejects it.
  const [redirect, setRedirect] = useState<string | undefined>();
  const [invalidToken, setInvalidToken] = useState<boolean>(false);
  if (redirect) {
    return <Redirect to={redirect} />;
  }
  if (!token || invalidToken) {
    return (
      <div className="section">
        <div className="notification is-danger">
          {
              invalidToken
                ? "Invalid request: Your request is invalid or has expired. Please start a new request using the link below."
                : "No reset token provided: Please copy the full link from the email, or start a new password reset request."
            }
        </div>
        <Link to="/reset">Reset your password</Link>
      </div>
    );
  }

  // The form
  return (
    <div className="section">
      <h1 className="title">Reset your password</h1>
      <p>The link for the page will expire in 1 hour, or when you submit. Please enter a new password for your account.</p>
      <Formik
        initialValues={{
          newPassword: "",
          confirmPassword: ""
        }}
        validationSchema={Yup.object({
          newPassword: PasswordValidation,
          confirmPassword: PasswordValidation
        })}
        onSubmit={async (values, { setErrors, setFieldError }) => {
          if (values.newPassword !== values.confirmPassword) {
            setFieldError("confirmPassword", "Passwords must match.");
            return;
          }
          try {
            await finishPasswordReset(token, values.newPassword);
            setRedirect("/");
          } catch (err) {
            if (err.response) {
              const error = await err.response.json();
              if (error.errors) {
                // Handles token failing invalidation (e.g. not right length)
                if (error.errors[0].property === "token") {
                  setInvalidToken(true);
                } else {
                  const mapped = mapErrors(error.errors);
                  setErrors(mapped);
                }
              } else if (error.message === "Invalid token: Expired or invalid token.") {
                setInvalidToken(true);
              } else {
                setFieldError("newPassword", error.message);
              }
              return;
            }
            throw new Error(err);
          }
        }}>

        {({ isSubmitting }) => (
          <Form>
            <InputField label="New password" type="password" name="newPassword" placeholder="Your new password" />
            <InputField label="Confirm new password" type="password" name="confirmPassword" placeholder="Confirm your password" />
            <button className={`button is-primary ${isSubmitting ? "is-loading" : ""}`} type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FinishReset;
