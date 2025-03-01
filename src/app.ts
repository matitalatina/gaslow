import "reflect-metadata";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MONGODB_URI } from "./util/secrets";

// Controllers (route handlers)
import "./controllers/stationController";
import { InversifyExpressServer } from "inversify-express-utils";
import { myContainer } from "./di/inversify.config";
import { Request, Response, NextFunction } from "express";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Create Express server
const server = new InversifyExpressServer(myContainer);

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

server.setConfig((app) => {
  app.set("port", process.env.PORT || 3000);
  app.use(compression());
  app.use(bodyParser.json());
});

// Express configuration
const app = server.build();

// Register the error handler middleware correctly
// Error handlers need to be registered last with all 4 parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

export default app;
