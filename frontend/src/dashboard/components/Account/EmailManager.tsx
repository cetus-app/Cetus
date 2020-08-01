import { Form, Formik } from "formik";
import React, { Fragment, FunctionComponent } from "react";
import * as Yup from "yup";

import { updateEmail } from "../../api";
import mapErrors from "../../api/mapErrors";
import InputField from "../forms/InputField";
import { shownMessage } from "./index";

interface EmailManagerProps {
  setMessage: Function,
  email: string,
  isVerified: boolean
}

// "Resending verification email" is just sending the request with the current email
const EmailManager: FunctionComponent<EmailManagerProps> = ({ setMessage, email, isVerified }) => (
  <Formik
    initialValues={{ email }}
    validationSchema={Yup.object({
      email: Yup.string()
        .email("Must be a valid email")
        .required("If updating email, you must provide one.")
    })}
    onSubmit={async (values, { setErrors, setFieldError }) => {
      try {
        await updateEmail(values.email);
        const msg: shownMessage = {
          messageContent: (
            <p>Email sent! Please check your inbox and spam folders.
              You should verify your email address as soon as possible.
            </p>),
          notificationType: "success"
        };
        window.scrollTo(0,0);
        setMessage(msg);
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

      <div className="columns">
        <div className="column is-6">
          <Form>
            {!isVerified ? <div className="notification is-warning">You have not verified your email address! <button className={`button is-text ${isSubmitting ? "is-loading" : ""}`} type="submit">Resend verification email</button></div> : ""}
            <InputField label="Email" type="email" name="email" placeholder="Email address" />
            <button className={`button is-primary ${isSubmitting ? "is-loading" : ""}`} type="submit">Update email</button>
          </Form>
        </div>
      </div>


    )}
  </Formik>
);

export default EmailManager;
