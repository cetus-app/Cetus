// Created by josh on 12/06/2020
import {
  ErrorMessage, Field, Form, Formik
} from "formik";
import React, { FunctionComponent } from "react";
import * as Yup from "yup";

import { addKey } from "../../../api/keys";
import mapErrors from "../../../api/mapErrors";

interface AddTokenFormProps {
  groupId: string,
  handleKeyAdd: Function
}

export const AddTokenForm: FunctionComponent<AddTokenFormProps> = ({ groupId, handleKeyAdd }) => (
  <Formik
    initialValues={{ name }}
    validationSchema={Yup.object({
      name: Yup.string()
        .min(1, "Your name must be at least 1 character long.")
        .max(30, "Must be 30 characters or less")
        .required("You must provide a name!")
    })}
    onSubmit={async (values, { setErrors, setFieldError }) => {
      try {
        const name = values.name ? values.name : "Unnamed token";
        const resp = await addKey(groupId, name);
        handleKeyAdd(resp);
      } catch (err) {
        if (err.response) {
          const error = await err.response.json();
          if (error.errors) {
            const mapped = mapErrors(error.errors);
            setErrors(mapped);
          } else {
            setFieldError("name", error.message);
          }
          return;
        }
        throw new Error(err);
      }
    }}>

    {({ isSubmitting, errors, touched }) => (
      <Form className="add-key-form">
        <p>This will add a new API key to your group, which can be used to interact with your group via. our API.</p>
        <div className="field" />
        <div className="field has-addons">
          <div className="control">
            <Field className={`input ${(errors.name && touched.name) ? "is-danger" : ""}`} type="text" placeholder="Friendly taken name" name="name" id="token-name" />
          </div>
          <div className="control">
            <button type="submit" className="button is-success" disabled={isSubmitting}>
              Generate
            </button>
          </div>
        </div>
        <p className="help is-danger"><ErrorMessage name="name" /></p>
      </Form>
    )}
  </Formik>
);
export default AddTokenForm;
