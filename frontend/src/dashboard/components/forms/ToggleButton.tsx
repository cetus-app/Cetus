// Created by josh on 07/06/2020
import { useField } from "formik";
import React, { FunctionComponent } from "react";

interface EnableButtonProps {
  setActiveText?: string,
  setInactiveText?: string,
  name: string
}

const ToggleButton: FunctionComponent<EnableButtonProps> = ({ setActiveText = "Enable", setInactiveText = "Disable", name }) => {
  const [, meta, helpers] = useField(name);


  const { value } = meta;

  const { setValue } = helpers;

  return (
    <button
      type="button"
      onClick={() => setValue(!value)}
      className={`button is-${value ? "danger" : "success"}`}>{value ? setInactiveText : setActiveText}
    </button>
  );
};
export default ToggleButton;
