// Created by josh on 07/06/2020
import { Field, Form, Formik } from "formik";
import React, { FunctionComponent } from "react";
import * as Yup from "yup";

import updateIntegration from "../../../../api/integrations/update";
import mapErrors from "../../../../api/mapErrors";
import { AntiAdminAbuseConfig, PartialIntegration } from "../../../../api/types";
import InputField, { Input } from "../../../forms/InputField";

// Updated is used to update the internal representation of the integration
interface AntiAbuseFormProps {
  integration: PartialIntegration
  update: Function
}

const AntiAbuseForm: FunctionComponent<AntiAbuseFormProps> = ({ integration, update }) => {
  const config = integration.config as AntiAdminAbuseConfig;
  const {
    demotionRank,
    revert,
    enabled,
    webhook, actionCount,
    actionTime
  } = config;
  return (
    <Formik
      initialValues={{
        demotionRank,
        revert,
        enabled,
        webhook: webhook || "",
        actionCount,
        actionTime
      }}
      validationSchema={Yup.object({
        demotionRank: Yup.number()
          .min(0, "Must be 0 or greater. 0 Disables demotion.")
          .max(255, "Must be less than 255.")
          .required("A demotion rank is required."),
        revert: Yup.boolean().required("You must provide a value for revert."),
        enabled: Yup.boolean().required("You must provide a value for enabled"),
        webhook: Yup.string().url("Webhook must be a valid url, or not be provided.").notRequired(),
        actionTime: Yup.number()
          .min(5, "We scan every 5 minutes - Must be > 5.")
          .max(60, "This should be a maximum of 60 minutes.")
          .required("You must supply a time frame for the action limit."),
        actionCount: Yup.number()
          .min(1, "Must be 1 or greater.")
          .max(999, "Why?")
          .required("You must supply an action limit.")
      })}
      onSubmit={async (values, { setErrors, setFieldError }) => {
        try {
          console.log("Submit..");
          const resp = await updateIntegration(integration.id, values);
          // It went ok
          update(resp);
        } catch (err) {
          if (err.response) {
            const error = await err.response.json();
            if (error.errors) {
              const mapped = mapErrors(error.errors);
              setErrors(mapped);
            } else {
              setFieldError("enabled", error.message);
            }
            return;
          }
          throw new Error(err);
        }
      }}>

      {({ isSubmitting, values }) => {
        const disabled = !values.enabled;
        return (
          <Form>
            <h2 className="is-size-4">Scan configuration</h2>
            <hr />
            <div className="field">
              <label className="label is-inline">Use Group defender</label>
              <div className="is-pulled-right slider-parent">
                <Field id="enabledSwitch" type="checkbox" name="enabled" className="switch is-pulled-right" />
                <label htmlFor="enabledSwitch" hidden />
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <Input label="Action count" name="actionCount" placeholder="Actions" type="number" disabled={disabled} />
              </div>
              <div className="control">
                <br />
                <br />
                actions per
              </div>
              <div className="control">
                <Input label="Action time" name="actionTime" placeholder="Minutes" type="number" disabled={disabled} />
              </div>
              <div className="control">
                <br />
                <br />
                Minute(s)
              </div>
            </div>
            <p className="is-size-7">The action limit is a rate limit for the numbers of actions a user can perform per X minutes. When a user exceeds this limit, our system takes action.</p>
            <h2 className="is-size-4">Defense configuration</h2>
            <hr />
            <p className="is-size-7">When our system takes action, you will receive an email notification. You can also supply a Discord webhook.</p>
            <p className="is-size-7">We will try to demote the user to your provided rank and then revert their abuse (if enabled).</p>
            <div className="field">
              <Input label="Demotion rank" type="number" name="demotionRank" placeholder="1-254, The rank attackers should be demoted to." max="254" min="0" disabled={disabled} />
              <small className="help">You can supply 0 to disable demotion. This is not recommended as it does not prevent abuse.</small>
            </div>
            <div className="field">
              <label className="label is-inline">Revert abuse</label>
              <div className="is-pulled-right slider-parent">
                <Field id="revertSwitch" type="checkbox" name="revert" className="switch is-pulled-right" disabled={disabled} />
                <label htmlFor="revertSwitch" hidden />
              </div>
              <small className="help">
                Note: We will attempt to revert abuse.
                At present we can only revert rank change abuse, and cannot guarantee that we&apos;ll catch everything.
              </small>
              <small className="help">
                We take no responsibility for any damage incurred from failed reversion. <a href="/terms">Read more in our terms.</a>
              </small>
            </div>
            <InputField label="Discord webhook (optional)" type="text" name="webhook" placeholder="https://discordapp.com/api/webhooks/xxxxxx/xxxxxxxxx" disabled={disabled} />
            <button className={`button is-primary ${isSubmitting ? "is-loading" : ""}`} type="submit">Submit</button>
          </Form>
        );
      }}
    </Formik>
  );
};
export default AntiAbuseForm;
