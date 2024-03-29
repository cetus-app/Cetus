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
import * as RobloxApiSchemas from "./controllers/RobloxController/v1/types";
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
      imgSrc: ["'self'", "data:", "https://*.cloudfront.net", "https://*.rbxcdn.com", "https://*.roblox.com", "https://*.stripe.com"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "https://checkout.stripe.com"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: true,
      connectSrc: ["https://checkout.stripe.com"],
      frameSrc: ["https://checkout.stripe.com"],
      "frame-ancestors": ["'self'", process.env.frontendUrl!]
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

if (process.env.NODE_ENV !== "development") {
  if (openApiSpec.paths) {
    const pathKeys: (keyof typeof openApiSpec.paths)[] = Object.keys(openApiSpec.paths);
    for (const pathKey of pathKeys) {
      if (typeof pathKey === "string" && !pathKey.toLowerCase().includes("/roblox/")) {
        delete openApiSpec.paths[pathKey];
      }
    }
  }

  if (openApiSpec.components?.schemas) {
    const robloxSchemaKeys = Object.keys(RobloxApiSchemas);
    for (const schemaKey of Object.keys(openApiSpec.components.schemas)) {
      if (!robloxSchemaKeys.includes(schemaKey)) {
        delete openApiSpec.components.schemas[schemaKey];
      }
    }
  }
}


if (!openApiSpec.components) openApiSpec.components = {};
openApiSpec.components.securitySchemes = {
  apiKeyAuth: {
    type: "http",
    scheme: "bearer"
  }
};

app.use("/docs", swaggerServe, setup(openApiSpec));

app.get("/swagger.json", (_req, res) => {
  res.send(openApiSpec);
});


export default app;
