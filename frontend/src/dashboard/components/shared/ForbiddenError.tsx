// Created by josh on 28/05/2020
import React, { FunctionComponent } from "react";

interface ForbiddenErrorProps {
  message?: string
}

const ForbiddenError: FunctionComponent<ForbiddenErrorProps> = ({ message }) => (
  <div className="message is-danger mt-2 mr-4 ml-4">
    <div className="message-header">
      <p>403: Forbidden</p>
    </div>
    <div className="message-body">
      <p>You do not have access to that resource.</p>
      {message}
    </div>
  </div>
);
export default ForbiddenError;
