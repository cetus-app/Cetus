// Express app
import { defaultMetadataStorage } from "class-transformer/storage";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import cookieParser from "cookie-parser";
import express from "express";
import { getMetadataArgsStorage, RoutingControllersOptions, useExpressServer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { setup, serve as swaggerServe } from "swagger-ui-express";

import controllers from "./controllers";
import middlewares from "./middleware";

const options: RoutingControllersOptions = {
  controllers,
  middlewares,
  authorizationChecker: action => !!action.request.user,
  currentUserChecker: action => action.request.user
};
const app = express();

app.use(cookieParser());

useExpressServer(app, options);

const schemas = validationMetadatasToSchemas({ classTransformerMetadataStorage: defaultMetadataStorage });
const metadataStorage = getMetadataArgsStorage();

const openApiSpec = routingControllersToSpec(metadataStorage, options, { components: { schemas } });
app.use("/docs", swaggerServe, setup(openApiSpec));

export default app;
