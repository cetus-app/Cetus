import { Form, Formik } from "formik";
import React, { FunctionComponent } from "react";
import * as Yup from "yup";

import { updatePassword } from "../../api";
import mapErrors from "../../api/mapErrors";
import InputField from "../forms/InputField";
import { PasswordValidation } from "../shared";

interface UpdatePasswordProps {
  handleDone: Function
}


const UpdatePassword: FunctionComponent<UpdatePasswordProps> = ({ handleDone }) => (
  <Formik
    initialValues={{
      newPassword: "",
      confirmNewPassword: "",
      currentPassword: ""
    }}
    validationSchema={Yup.object({
      currentPassword: PasswordValidation.notRequired(),
      newPassword: PasswordValidation,
      confirmNewPassword: PasswordValidation
    })}
    onSubmit={async (values, { setErrors, setFieldError }) => {
      if (values.newPassword !== values.confirmNewPassword) {
        setFieldError("confirmPassword", "Passwords must match.");
        return;
      }
      try {
        await updatePassword(values.currentPassword, values.newPassword);
        handleDone();
      } catch (err) {
        if (err.response) {
          const error = await err.response.json();
          if (error.errors) {
            const mapped = mapErrors(error.errors);
            setErrors(mapped);
          } else {
            setFieldError("confirmNewPassword", error.message);
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
            <p>
              If you created your account by connecting to Discord and have not set your password yet,
              leave the <code>Current password</code> field blank.
            </p>
            <InputField label="Current password" type="password" name="currentPassword" placeholder="Your current password" />
            <InputField label="New password" type="password" name="newPassword" placeholder="Enter your new password" />
            <InputField label="Confirm new password" type="password" name="confirmNewPassword" placeholder="Confirm your new password" />
            <button className={`button is-primary ${isSubmitting ? "is-loading" : ""}`} type="submit">Change password</button>
          </Form>
        </div>
      </div>
    )}
  </Formik>
);

export default UpdatePassword;
