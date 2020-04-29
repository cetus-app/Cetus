// Express app
import { getFromContainer, MetadataStorage } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { createExpressServer, getMetadataArgsStorage, RoutingControllersOptions } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { setup, serve as swaggerServe } from "swagger-ui-express";

import controllers from "./controllers";
import { Action } from "./types";

const options: RoutingControllersOptions = {
  controllers,
  // Example
  authorizationChecker: (action: Action, _roles: string[]) => {
    const token = action.request.header("authorization");

    return token === "top sekret";
  }
};

const app = createExpressServer(options);

const { validationMetadatas } = getFromContainer(MetadataStorage) as any;
const schemas = validationMetadatasToSchemas(validationMetadatas);
const metadataStorage = getMetadataArgsStorage();

const openApiSpec = routingControllersToSpec(metadataStorage, options, { components: { schemas } });
app.use("/docs", swaggerServe, setup(openApiSpec));

export default app;
