import "reflect-metadata";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import "./controllers/stationController";
import { InversifyExpressServer } from "inversify-express-utils";
import { myContainer } from "./di/inversify.config";

// Create Express server
const server = new InversifyExpressServer(myContainer);

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, { useMongoClient: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

server.setConfig((app) => {
  app.set("port", process.env.PORT || 3000);
  app.use(compression());
  app.use(bodyParser.json());
});

// Express configuration
const app = server.build();
export default app;