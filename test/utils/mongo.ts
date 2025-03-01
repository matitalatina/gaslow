import mongoose from "mongoose";

const mongoUrl = "mongodb://localhost:27017/gaslow_test";

export function connectMongoTest(): Promise<void> {
  return mongoose
    .connect(mongoUrl)
    .then(() => {
      /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
      console.log("Test MongoDB connected successfully");
    })
    .catch((err) => {
      console.log(
        `MongoDB connection error. Please make sure MongoDB is running. ${err}`,
      );
    });
}

export function closeMongoTest(): Promise<void> {
  return mongoose.connection.close();
}
