import { MongoClient, type Db, type Collection, type Document } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

export async function connectMongoTest(): Promise<void> {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  client = new MongoClient(mongoUri);
  await client.connect();
  
  // Ensure indexes for tests that need geospatial queries
  const db = client.db();
  await db.collection("stations").createIndex({ location: "2dsphere" });
  
  console.log("Test MongoDB (in-memory) connected successfully via MongoClient");
}

export async function closeMongoTest(): Promise<void> {
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export function getTestDb(): Db {
  return client.db();
}

export function getTestCollection<T extends Document = any>(name: string): Collection<T> {
  return getTestDb().collection<T>(name);
}
