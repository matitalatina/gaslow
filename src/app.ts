import "reflect-metadata";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { TYPES } from "./di/types.js";
import { myContainer } from "./di/inversify.config.js";
import type { DbConnector } from "./repositories/DbConnector.js";
import { ValidationErrorFilter } from "./filters/ValidationErrorFilter.js";

// Controllers (route handlers)
import "./controllers/stationController.js";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express";
import type { Request, Response, NextFunction } from "express";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

import express from "express";

async function getApp() {
  const app = express();

  // Express configuration
  app.set("port", process.env.PORT || 3000);
  app.use(compression());
  app.use(bodyParser.json());

  // Connect to MongoDB and ensure indexes before building the Inversify server
  const dbConnector = myContainer.get<DbConnector>(TYPES.DbConnector);
  await dbConnector.connect();

  // Pass the configured app to the adapter
  // The adapter will attach routes to this app
  const builder = new InversifyExpressHttpAdapter(myContainer, {}, app);
  builder.useGlobalFilters(ValidationErrorFilter);
  const configuredApp = await builder.build();

  // Register the error handler middleware correctly
  // Error handlers need to be registered last with all 4 parameters
   
  configuredApp.use(
    (err: Error, req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    },
  );

  return configuredApp;
}

export default getApp;
