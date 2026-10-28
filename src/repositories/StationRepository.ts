import { injectable, inject } from "inversify";
import type { Collection, DeleteResult } from "mongodb";
import type { DbStation, Station } from "../models/Station.js";
import { toStation, DbStationSchema } from "../models/Station.js";
import type { Polygon } from "geojson";
import moment from "moment";
import { TYPES } from "../di/types.js";

const BULK_WRITE_BATCH_SIZE = 5000;
const BULK_WRITE_CONCURRENCY = 4;

export interface IStationRepository {
  bulkUpsertById(stations: DbStation[]): Promise<void>;
  findNearestByCoordinates(
    lat: number,
    lng: number,
    limit?: number,
  ): Promise<Station[]>;
  findWithinPolygon(geom: Polygon, limit?: number): Promise<Station[]>;
  findByIds(ids: number[]): Promise<Station[]>;
  deleteMany(filter: object): Promise<DeleteResult>;
  findOne(filter: object): Promise<Station | null>;
  find(filter: object, limit?: number): Promise<Station[]>;
}

@injectable()
export class StationRepository implements IStationRepository {
  constructor(
    @inject(TYPES.StationCollection) private collection: Collection<DbStation>,
  ) {}

  private filterByPriceUpdatedAt(updatedAt: Date) {
    return { "prices.updatedAt": { $gte: updatedAt } };
  }

  async bulkUpsertById(stations: DbStation[]): Promise<void> {
    const validStations = stations.filter((s) => {
      if (!s.location || !s.location.coordinates) return false;
      const hasValidCoords =
        isFinite(s.location.coordinates[0]) &&
        isFinite(s.location.coordinates[1]);
      if (!hasValidCoords) {
        console.log(`Invalid coords: ${JSON.stringify(s)}`);
      }
      return hasValidCoords;
    });

    const batchCount = Math.ceil(validStations.length / BULK_WRITE_BATCH_SIZE);
    let nextBatch = 0;
    let firstError: unknown;

    console.log(
      `[stations] upserting ${validStations.length} stations in ${batchCount} batches`,
    );

    const worker = async () => {
      while (firstError === undefined) {
        const batchIndex = nextBatch++;
        if (batchIndex >= batchCount) return;

        const stationUpdates = validStations
          .slice(
            batchIndex * BULK_WRITE_BATCH_SIZE,
            (batchIndex + 1) * BULK_WRITE_BATCH_SIZE,
          )
          .map((station) => ({
            updateOne: {
              filter: { id: station.id },
              update: {
                $set: {
                  ...station,
                  updatedAt: new Date(),
                },
                $setOnInsert: { createdAt: new Date() },
              },
              upsert: true,
            },
          }));

        const startedAt = Date.now();
        console.log(
          `[stations] batch ${batchIndex + 1}/${batchCount} started (${stationUpdates.length} stations)`,
        );

        try {
          await this.collection.bulkWrite(stationUpdates);
          console.log(
            `[stations] batch ${batchIndex + 1}/${batchCount} persisted in ${Date.now() - startedAt}ms`,
          );
        } catch (error) {
          firstError = error;
          return;
        }
      }
    };

    const workerCount = Math.min(BULK_WRITE_CONCURRENCY, batchCount);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    if (firstError !== undefined) {
      throw firstError;
    }

    console.log(`[stations] upsert finished for ${validStations.length} stations`);
  }

  async findNearestByCoordinates(
    lat: number,
    lng: number,
    limit: number = 100,
  ): Promise<Station[]> {
    const results = await this.collection
      .find({
        location: {
          $near: { $geometry: { type: "Point", coordinates: [lng, lat] } },
        },
        ...this.filterByPriceUpdatedAt(moment().subtract(1, "months").toDate()),
      })
      .limit(limit)
      .toArray();

    return results.map((doc) => toStation(DbStationSchema.parse(doc)));
  }

  async findWithinPolygon(
    geom: Polygon,
    limit: number = 300,
  ): Promise<Station[]> {
    const results = await this.collection
      .find({
        location: { $geoWithin: { $geometry: geom } },
        ...this.filterByPriceUpdatedAt(moment().add(-1, "months").toDate()),
      })
      .limit(limit)
      .toArray();

    return results.map((doc) => toStation(DbStationSchema.parse(doc)));
  }

  async findByIds(ids: number[]): Promise<Station[]> {
    const results = await this.collection
      .find({
        id: { $in: ids },
        ...this.filterByPriceUpdatedAt(moment().add(-1, "months").toDate()),
      })
      .toArray();

    return results.map((doc) => toStation(DbStationSchema.parse(doc)));
  }

  async deleteMany(filter: object): Promise<DeleteResult> {
    return this.collection.deleteMany(filter);
  }

  async findOne(filter: object): Promise<Station | null> {
    const doc = await this.collection.findOne(filter);
    if (!doc) return null;
    return toStation(DbStationSchema.parse(doc));
  }

  async find(filter: object, limit?: number): Promise<Station[]> {
    let cursor = this.collection.find(filter);
    if (limit) {
      cursor = cursor.limit(limit);
    }
    const results = await cursor.toArray();
    return results.map((doc) => toStation(DbStationSchema.parse(doc)));
  }
}
