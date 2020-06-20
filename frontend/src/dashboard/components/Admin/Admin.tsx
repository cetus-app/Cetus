import { Formik, FormikHelpers } from "formik";
import React, { FunctionComponent, useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";

import { ApiError } from "../../api";
import { addBot } from "../../api/bots";
import mapErrors from "../../api/mapErrors";
import { addBotBody, AddBotBody } from "../../api/types/Bot";
import AddBot from "./Bots/AddBot";

const Admin: FunctionComponent = () => {
  const { url } = useRouteMatch();
  const [showAddBot, setShowAddBot] = useState(false);

  const handleAddBotSubmit = (
    values: AddBotBody,
    { setErrors, setFieldError, setSubmitting }: FormikHelpers<AddBotBody>
  ): Promise<void> => addBot(values).then(() => setShowAddBot(false)).catch(async e => {
    if (e instanceof ApiError) {
      const data = await e.response.json();

      if (data.errors) setErrors(mapErrors(data.errors));
      else setFieldError("robloxId", data.message);

      return;
    }

    throw e;
  }).finally(() => setSubmitting(false));

  return (
    <section className="section columns is-centered">
      <div className="column is-10">
        <div className="content">
          <h1 className="title">Admin</h1>
          <ul>
            <li>
              <h4>Bots</h4>
              <ul>
                <li>
                  <Link to={`${url}/bots/manage`}>Manage</Link>
                </li>
                <li>
                  <Link to={`${url}/bots/queue`}>Queue</Link>
                </li>
                <li>
                  {
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                }<a href="#" onClick={() => setShowAddBot(true)}>Add bot</a>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {showAddBot && (
          <Formik
            initialValues={{
              robloxId: 0,
              cookie: ""
            }}
            validationSchema={addBotBody}
            validateOnChange
            onSubmit={handleAddBotSubmit}>
            {state => <AddBot onClose={() => setShowAddBot(false)} formState={state} />}
          </Formik>
        )}
      </div>
    </section>
  );
};

export default Admin;
