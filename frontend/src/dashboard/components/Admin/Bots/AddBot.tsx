import { Form, FormikProps } from "formik";
import React, { FunctionComponent } from "react";

import { AddBotBody } from "../../../api/types/Bot";
import InputField from "../../forms/InputField";

export interface AddBotProps {
  onClose (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  formState: FormikProps<AddBotBody>;
}

const AddBot: FunctionComponent<AddBotProps> = ({ onClose, formState: { isSubmitting } }) => (
  <fieldset disabled={isSubmitting}>
    <div className="modal is-active">
      <div className="modal-background" />

      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Add bot</p>
          <button type="button" className="delete" aria-label="close" onClick={onClose} />
        </header>
        <Form>
          <section className="modal-card-body">

            <InputField name="robloxId" label="Roblox ID" type="number" className="input no-arrows" />

            <InputField name="cookie" label="Cookie" type="text" />
          </section>

          <footer className="modal-card-foot">
            <button type="submit" className={`button is-success${isSubmitting ? " is-loading" : ""}`}>Save</button>
            <button type="button" className="button" onClick={onClose}>Cancel</button>
          </footer>
        </Form>
      </div>
    </div>
  </fieldset>
);

export default AddBot;
