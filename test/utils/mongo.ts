import bluebird from "bluebird";
import mongoose from "mongoose";
const mongoUrl = "mongodb://localhost:27017/gaslow_test";

export function connectMongoTest(): Promise<void> {
  (<any>mongoose).Promise = bluebird;
  return mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, }).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
  ).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
  });
}

export function closeMongoTest(): Promise<void> {
  return mongoose.connection.close();
}
