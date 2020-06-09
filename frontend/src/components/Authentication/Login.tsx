import { Form, Formik } from "formik";
import React, { FunctionComponent } from "react";
import * as Yup from "yup";
import "./auth.css";

import { login } from "../../api/authentication";
import mapErrors from "../../api/mapErrors";
import { ButtonClick } from "../../types";
import BasicInput from "../shared/Input";

interface LoginProps {
  toRegister: ButtonClick,
  setUser: Function
}


export const Login: FunctionComponent<LoginProps> = ({ toRegister, setUser }) => (
  <div>
    <div className="box auth-box">
      <h1 className="title">Login</h1>
      <Formik
        initialValues={{
          email: "",
          password: ""
        }}
        validationSchema={Yup.object({
          password: Yup.string()
            .min(6, "Your password must be at least 6 characters long.")
            .max(100, "Must be 100 characters or less")
            .required("Required"),
          email: Yup.string()
            .email("Invalid email address")
            .required("Required")
        })}
        onSubmit={async (values, { setErrors, setFieldError }) => {
          try {
            const resp = await login(values.email, values.password);

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
            <BasicInput label="Email Address" type="email" name="email" helpText="Either the email you signed up with, or the email on the Discord account you used." />
          </div>

          <div className="field">
            <BasicInput label="Password" type="password" name="password" />
          </div>

          <button type="submit" className="button is-fullwidth is-primary">Login</button>
        </Form>
      </Formik>
    </div>
    <div className="has-text-centered">
      <button type="button" className="button is-text" onClick={toRegister}>Already got an account?</button>
    </div>
  </div>

);

export default Login;