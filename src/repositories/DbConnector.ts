import { injectable } from "inversify";
import { MongoClient, type Db, type Collection, type Document } from "mongodb";
import { MONGODB_URI } from "../util/secrets.js";

@injectable()
export class DbConnector {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<Db> {
    if (this.db) return this.db;

    this.client = new MongoClient(MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db();

    console.log("MongoDB connected successfully");

    // Ensure indexes
    const stationsCollection = this.db.collection("stations");
    await stationsCollection.createIndex({ id: 1 }, { unique: true });
    await stationsCollection.createIndex({ location: "2dsphere" });
    console.log("Indexes ensured on stations collection");

    return this.db;
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  getCollection<T extends Document>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}
