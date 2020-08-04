// Express app
import { RewriteFrames, Transaction } from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import { defaultMetadataStorage } from "class-transformer/storage";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { getMetadataArgsStorage, RoutingControllersOptions, useExpressServer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { setup, serve as swaggerServe } from "swagger-ui-express";

import controllers from "./controllers";
import { PermissionLevel } from "./entities/User.entity";
import middlewares from "./middleware";
import { name, version } from "./package.json";
import { Action } from "./types";

const options: RoutingControllersOptions = {
  controllers,
  middlewares,
  authorizationChecker: ({ request: { user } }: Action, roles: PermissionLevel[]) => {
    if (!user) return false;

    if (roles.length === 0) return true;

    return roles.includes(user.permissionLevel);
  },
  currentUserChecker: action => action.request.user,
  cors: {
    origin: process.env.frontendUrl,
    credentials: true
  },
  validation: { forbidUnknownValues: true }
};

// Sentry setup
global.sentryRoot = __dirname || process.cwd();
if (process.env.sentryToken) {
  Sentry.init({
    dsn: process.env.sentryToken,
    integrations: [new RewriteFrames({ root: global.sentryRoot }), new Transaction()],
    release: `${name}@${version}`
  });
}


const app = express();

app.use(Sentry.Handlers.requestHandler());
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      blockAllMixedContent: true,
      fontSrc: ["'self'", "https:", "data:"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: true,
      connectSrc: ["https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"]
    }
  }
}));

useExpressServer(app, options);

const schemas = validationMetadatasToSchemas({
  classTransformerMetadataStorage: defaultMetadataStorage,
  refPointerPrefix: "#/components/schemas/"
});
const metadataStorage = getMetadataArgsStorage();
const openApiSpec = routingControllersToSpec(metadataStorage, options, { components: { schemas } });

if (!openApiSpec.paths) {
  const pathKeys: (keyof typeof openApiSpec.paths)[] = Object.keys(openApiSpec.paths);
  for (const pathKey of pathKeys) {
    if (typeof pathKey === "string" && !pathKey.toLowerCase().includes("/roblox/")) {
      delete openApiSpec.paths[pathKey];
    }
  }
}


app.use("/docs", swaggerServe, setup(openApiSpec));

// Temporary
app.get("/swagger.json", (_req, res) => {
  res.send(openApiSpec);
});


export default app;
