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
  // My proposal is that we use authorizationChecker for authorised actions that aren't associated with a user
  // For example - The "Public" API which is authorised with Group API tokens
  authorizationChecker: (action: Action, _roles: string[]) => {
    const token = action.request.header("authorization");

    return token === "top sekret";
  },

  // And then this is used to validate Panel/User associated ones
  // If Current user is marked as required on a route and it isn't returned,
  // it returns unauthorised anyway - so that works.
  currentUserChecker: async (_action: Action) => false
};

const app = createExpressServer(options);

const { validationMetadatas } = getFromContainer(MetadataStorage) as any;
const schemas = validationMetadatasToSchemas(validationMetadatas);
const metadataStorage = getMetadataArgsStorage();

const openApiSpec = routingControllersToSpec(metadataStorage, options, { components: { schemas } });
app.use("/docs", swaggerServe, setup(openApiSpec));

export default app;
