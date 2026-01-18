// Import reflect-metadata with a dynamic import to ensure it's loaded correctly
import "reflect-metadata";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MONGODB_URI } from "./util/secrets.js";

// Controllers (route handlers)
import "./controllers/stationController.js";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express";
import { myContainer } from "./di/inversify.config.js";
import type { Request, Response, NextFunction } from "express";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Create Express server adapter
const adapter = new InversifyExpressHttpAdapter(myContainer);

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
// mongoose.set("strictQuery", true); // This is no longer needed in Mongoose 8.x
mongoose
  .connect(mongoUrl)
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`,
    );
    // process.exit();
  });

import express from "express";
const app = express();
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());

// Pass the configured app to the adapter
// The adapter will attach routes to this app
const builder = new InversifyExpressHttpAdapter(myContainer, {}, app);

export const getApp = () =>builder.build().then((configuredApp) => {
  // Register the error handler middleware correctly
  // Error handlers need to be registered last with all 4 parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configuredApp.use(
    (err: Error, req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    },
  );
  return configuredApp;
});

export default getApp;
