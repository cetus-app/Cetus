// Entry point for backend
import "reflect-metadata";
import { createConnection } from "typeorm";

import app from "./app";

createConnection().then(() => {
  const port = process.env.port || 4000;

  app.listen(port, () => console.log(`App listening on port ${port}`));
});
