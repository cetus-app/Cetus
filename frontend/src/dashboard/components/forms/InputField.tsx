import { FieldHookConfig, useField } from "formik";
import React, { FunctionComponent } from "react";

export interface CustomInputFieldProps {
  label: string;
}

export type InputFieldProps = FieldHookConfig<string | number> & CustomInputFieldProps;

const InputField: FunctionComponent<InputFieldProps> = ({ label, ...props }) => {
  const [field, { touched, error }] = useField(props);

  return (
    <div className="field">
      <label className="label">{label}</label>

      <div className="control">
        {/* Something weird with the union type `GenericFieldHTMLAttributes` from Formik.
        Must be a TypeScript bug, seems like it is trying to satisfy all of the types, instead of just one (union)
        @ts-ignore */}
        <input className="input" {...field} {...props} />
      </div>

      {touched && error ? <p className="help is-danger">{error}</p> : null}
    </div>
  );
};

export default InputField;
