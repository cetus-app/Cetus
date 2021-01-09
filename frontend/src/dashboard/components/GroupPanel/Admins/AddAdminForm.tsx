// Created by josh on 12/06/2020
import {
  ErrorMessage, Field, Form, Formik
} from "formik";
import React, { FunctionComponent } from "react";
import * as Yup from "yup";

import { getAdmin } from "../../../api";
import mapErrors from "../../../api/mapErrors";
import { AdminInfo } from "../../../api/types";

interface AddAdminFormProps {
  isDisabled: boolean,
  handleInput: { (info: AdminInfo): any }
}

/**
 * Allows a group owner to enter a Roblox username or Roblox id and validates it. Passes up the AdminInfo via. handleInput
 * if successful.
 * @param handleInput: Function to call with the AdminInfo if a valid user is provided.
 */
export const AddAdminForm: FunctionComponent<AddAdminFormProps> = ({ handleInput, isDisabled }) => (
  <Formik
    initialValues={{ name }}
    validationSchema={Yup.object({
      name: Yup.string()
        .min(3, "Username or id must be at least 3 characters long.")
        .max(20, "Must be 20 characters or less")
        .required("You must provide a name or id.")
    })}
    onSubmit={async (values, { setErrors, setFieldError }) => {
      if (!isNaN(values.name)) {
        // if it's a number
        const num = parseInt(values.name, 10);
        if (num < 0 || num > 10000000000000000) {
          return setFieldError("name", "Id must be greater than 0 and less than max.");
        }
      }
      try {
        const resp = await getAdmin(values.name);
        handleInput(resp);
      } catch (err) {
        if (err.response) {
          const error = await err.response.json();
          if (error.errors) {
            const mapped = mapErrors(error.errors);
            return setErrors(mapped);
          }
          return setFieldError("name", error.message);
        }
        throw new Error(err);
      }
      return undefined;
    }}>

    {({ isSubmitting, errors, touched }) => (
      <Form className="add-key-form">
        <div className="field" />
        <div className="field has-addons">
          <div className="control">
            <Field className={`input ${(errors.name && touched.name) ? "is-danger" : ""}`} disabled={isDisabled} type="text" placeholder="Username or id to add" name="name" id="admin-name" />
          </div>
          <div className="control">
            <button type="submit" className="button is-primary" disabled={isSubmitting || isDisabled}>
              Submit
            </button>
          </div>
        </div>
        <p className="help is-danger"><ErrorMessage name="name" /></p>
      </Form>
    )}
  </Formik>
);
export default AddAdminForm;
