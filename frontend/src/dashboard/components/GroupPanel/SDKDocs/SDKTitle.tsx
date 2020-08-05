/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
import React, { FunctionComponent } from "react";


interface SDKTitleProps {
  text: string,
  size: number
}
const space = new RegExp(" ", "g");
const SDKTitle: FunctionComponent<SDKTitleProps> = ({ text, size }) => {
  const id = text.replace(space, "-");
  function handleClick () {
    navigator.clipboard.writeText(`${window.location.href}#${id}`);
  }

  return (
    <h2
      className={`subtitle is-${size} sdk-title`}
      id={id}
      onKeyDown={handleClick}
      onClick={handleClick}>
      {text}
    </h2>
  );
};
export default SDKTitle;
