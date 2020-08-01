import { Form, Formik } from "formik";
import React, { FunctionComponent, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import * as Yup from "yup";
import "./auth.css";


import { login } from "../../api/authentication";
import mapErrors from "../../api/mapErrors";
import { PasswordValidation } from "../shared";
import BasicInput from "../shared/Input";

interface LoginProps {
  setUser: Function
}


export const Login: FunctionComponent<LoginProps> = ({ setUser }) => {
  const [redirect, setRedirect] = useState<string|undefined>();
  if (redirect) {
    return <Redirect to={redirect} from="/login" />;
  }
  return (
    <div>
      <div className="box auth-box">
        <h1 className="title has-text-centered">Login to your account</h1>
        <Formik
          initialValues={{
            email: "",
            password: ""
          }}
          validationSchema={Yup.object({
            password: PasswordValidation,
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
              <small className="help"><Link to="/reset">Forgotten your password?</Link></small>
            </div>

            <button type="submit" className="button is-fullwidth is-primary">Login</button>
          </Form>
        </Formik>
      </div>
      <div className="has-text-centered">
        <button type="button" className="button is-text" onClick={() => setRedirect("/register")}>Need to make an account?</button>
      </div>
    </div>

  );
};

export default Login;
