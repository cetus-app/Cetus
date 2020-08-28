// Created by josh on 02/06/2020
import { Form, Formik } from "formik";
import React, { FunctionComponent, useState } from "react";
import { Redirect } from "react-router-dom";
import discordLogo from "url:../../assets/discord_logo_white.svg";
import * as Yup from "yup";

import "./auth.css";

import registerPost from "../../api/authentication/register";
import mapErrors from "../../api/mapErrors";
import { PasswordValidation } from "../shared";
import BasicInput, { Checkbox } from "../shared/Input";


interface RegisterProps {
  setUser: Function
}


export const Register: FunctionComponent<RegisterProps> = ({ setUser }) => {
  const [redirect, setRedirect] = useState<string|undefined>();
  if (redirect) {
    return <Redirect to={redirect} from="/register" />;
  }
  return (
    <div>
      <div className="box auth-box">
        <h1 className="title has-text-centered">Create an account</h1>
        <p>You need an account in order to take advantage of our service.</p>
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
            acceptedTerms: false
          }}
          validationSchema={Yup.object({
            password: PasswordValidation,
            confirmPassword: PasswordValidation,
            email: Yup.string()
              .email("Invalid email address")
              .required("Please provide an email."),
            acceptedTerms: Yup.boolean()
              .required("Required")
              .oneOf([true], "You must accept our terms and conditions to continue!")
          })}
          onSubmit={async (values, { setErrors, setFieldError }) => {
            if (values.password !== values.confirmPassword) {
              setFieldError("confirmPassword", "Passwords must match.");
            }
            try {
              const resp = await registerPost(values.email, values.password);

              // It went ok
              setUser(resp);
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

          <Form>
            <div className="field">
              <BasicInput label="Email Address" type="email" name="email" helpText="We will never share your email with anyone." />
            </div>

            <div className="field">
              <BasicInput label="Password" type="password" name="password" />
            </div>

            <div className="field">
              <BasicInput label="Confirm password" type="password" name="confirmPassword" helpText="Just to make sure we got it down right!" />
            </div>

            <div className="field">
              <Checkbox name="acceptedTerms">
                I agree to the <a href="/policies#terms" target="_blank">Terms and conditions</a>.
              </Checkbox>
            </div>

            <button type="submit" className="button is-fullwidth is-primary">Get started</button>
            <p className="has-text-centered">or</p>
            <a href={`${process.env.BACKEND_URL}/auth/discord`} className="button is-fullwidth discord-login-button">Register with <img src={discordLogo} alt="Discord" /></a>
            <p className="has-text-centered">Clicking the button above implies that you agree to our <a href="/policies#terms" target="_blank">Terms and conditions</a></p>
          </Form>
        </Formik>
      </div>
      <div className="has-text-centered">
        <button type="button" className="button is-text" onClick={() => setRedirect("/login")}>Already got an account?</button>
      </div>
    </div>

  );
};

export default Register;
