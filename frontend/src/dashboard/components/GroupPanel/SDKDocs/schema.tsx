// Created by josh on 07/06/2020
import React, {
  FunctionComponent, ReactNode, useEffect, useState
} from "react";

import { SchemaType } from "../../../api/types";

interface SchemaProps {
  name: string,
  schemas: SchemaType|null
}

const Schema: FunctionComponent<SchemaProps> = ({ name, schemas }) => {
  const [displaySchema, setDisplay] = useState<ReactNode|null>();
  useEffect(() => {
    // Work out displaySchema
    if (displaySchema || !schemas) {
      return undefined;
    }
    // So much code to handle something relatively simple
    // Supports type: "..." properties and basic schema references.
    function handleObject (schemaKey: string): ReactNode {
      if (!schemas) return [<p>No schemas!</p>];
      const base = schemas[schemaKey];
      if (!base) {
        return [<p>Failed: Schema {schemaKey} was not found.</p>];
      }
      const lines = [];
      const keys = Object.keys(base.properties);
      for (const key of keys) {
        const field = base.properties[key];
        if (field.type) {
          if (field.type === "array" && field.items) {
            const str = field.items.$ref;
            const schemaName = str.substr(str.lastIndexOf("/") + 1);
            lines.push(<div>{key}: [{handleObject(schemaName)}]</div>);
          } else {
            // Support for dates
            const typeStr = field.pattern && field.pattern === "d{4}-[01]d-[0-3]dT[0-2]d:[0-5]d:[0-5]d.d+Z?"
              ? "string (ISO 8601 Date)"
              : field.type;

            lines.push(<span className="line" key={`${key}-${Math.random()}`}>{key}: <code>{typeStr}</code></span>);
          }
        } else if (field.$ref) {
          const str = field.$ref;
          const schemaName = str.substr(str.lastIndexOf("/") + 1);
          lines.push(<div>{key}: {handleObject(schemaName)}</div>);
        }
      }
      return (
        <div className="schema-block">
          <span className="line schema-name" key={`title-${schemaKey}`}>Schema: <span className="is-size-5">{schemaKey}</span></span>
          {lines}
        </div>
      );
    }
    setDisplay(handleObject(name));


    return undefined;
  });
  return (
    <div className="container">
      {displaySchema || "Loading..."}
    </div>
  );
};
export default Schema;
