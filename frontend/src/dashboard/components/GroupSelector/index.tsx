// This handles the rendering of a collection of groups. It fires the given event with the group ID.
// It is used to both render "Linked groups" and "unlinked groups"
import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";

import "./GroupMenu.scss";

interface GroupMenuProps {
  title: string,
  subtitle: string,
  isUnlinked?: boolean
}

const GroupSelector: FunctionComponent<GroupMenuProps> = ({
  children, title, subtitle, isUnlinked
}) => (
  <div className="columns is-centered section">
    <div className="column is-10">
      <div className="columns">
        <div className="column is-10">
          <h1 className="title">{title}</h1>
          <h3 className="subtitle is-5">{subtitle}</h3>
        </div>
        {
            !isUnlinked
              ? (
                <div className="column is-1 is-offset-1">
                  <Link to="unlinked" className="button is-primary">Add group</Link>
                </div>
              )
              : ""

          }

      </div>

      <section className="section">
        <div className="group-selector columns is-multiline is-tablet">
          { children }
        </div>
      </section>
    </div>
  </div>
);
export default GroupSelector;
