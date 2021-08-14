import 'reflect-metadata';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MONGODB_URI } from './util/secrets';

// Controllers (route handlers)
import './controllers/stationController';
import { InversifyExpressServer } from 'inversify-express-utils';
import { myContainer } from './di/inversify.config';
import { NextFunction, Request, Response } from 'express';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env.example' });

// Create Express server
const server = new InversifyExpressServer(myContainer);

const jsonErrorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err });
};

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch((err) => {
  console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
  // process.exit();
});

server.setConfig((app) => {
  app.set('port', process.env.PORT || 3000);
  app.use(compression());
  app.use(bodyParser.json());
});

// Express configuration
const app = server.build();
app.use(jsonErrorHandler);
export default app;
