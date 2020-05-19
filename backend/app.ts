// Express app
import { RewriteFrames } from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import { defaultMetadataStorage } from "class-transformer/storage";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import cookieParser from "cookie-parser";
import express from "express";
import { getMetadataArgsStorage, RoutingControllersOptions, useExpressServer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { setup, serve as swaggerServe } from "swagger-ui-express";

import controllers from "./controllers";
import middlewares from "./middleware";
import { name, version } from "./package.json";

const options: RoutingControllersOptions = {
  controllers,
  middlewares,
  authorizationChecker: action => !!action.request.user,
  currentUserChecker: action => action.request.user
};

// Sentry setup
global.sentryRoot = __dirname || process.cwd();
if (process.env.NODE_ENV !== "production") {
  Sentry.init({
    dsn: process.env.sentry,
    integrations: [new RewriteFrames({ root: global.sentryRoot })],
    release: `${name}@${version}`
  });
}

const app = express();

app.use(Sentry.Handlers.requestHandler());
app.use(cookieParser());

useExpressServer(app, options);

const schemas = validationMetadatasToSchemas({ classTransformerMetadataStorage: defaultMetadataStorage });
const metadataStorage = getMetadataArgsStorage();

const openApiSpec = routingControllersToSpec(metadataStorage, options, { components: { schemas } });
app.use("/docs", swaggerServe, setup(openApiSpec));

// Temporary
app.get("/swagger.json", (_req, res) => {
  res.send(openApiSpec);
});
// Sentry error reporting
app.use(Sentry.Handlers.errorHandler());

export default app;
