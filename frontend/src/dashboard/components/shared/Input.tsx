// A helper component for inputs
import {
  ErrorMessage, FieldConfig, Field as FormikField, useField
} from "formik";
import React, { Fragment, FunctionComponent } from "react";

interface baseProps extends FieldConfig<any>{
  name: string,
  helpText?: string,
}
interface InputProps extends baseProps{
  label: string,
  type: string,
  name: string,
  placeholder?: string
}
const ErrorComponent:FunctionComponent = ({ children }) => (
  <p className="help is-danger">
    {children}
  </p>
);
// Linter doesn't like use of spread for props
export const Input: FunctionComponent<InputProps> = ({
  validate, name, render, children, as: is, component, helpText, type, placeholder, label
}) => (
  <Fragment>
    <label className="label">{label}</label>

    <div className="control">
      <FormikField className="input" validate={validate} render={render} name={name} as={is} component={component} type={type} placeholder={placeholder}>
        {children}
      </FormikField>
      {helpText ? <p className="help">{helpText}</p> : ""}
      <ErrorMessage component={ErrorComponent} name={name} />
    </div>
  </Fragment>
);

export const Checkbox = ({ children, name, ...props }: baseProps) => {
  // We need to tell useField what type of input this is
  // since React treats radios and checkboxes differently
  // than inputs/select/textarea.
  const [field] = useField({
    type: "checkbox",
    name,
    ...props
  });
  return (
    <div className="control">
      <label className="checkbox">
        <input type="checkbox" {...field} {...props} />
        {children}
      </label>
      <ErrorMessage component={ErrorComponent} name={name} />
    </div>
  );
};

export default Input;
