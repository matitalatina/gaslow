import { range } from "lodash-es";
import moment from "moment";
import { FuelTypeEnum } from "../../src/models/Station.js";
import type { Station } from "../../src/models/Station.js";
import { aStation, aPrice } from "../utils/fixtures.js";
import { StationRepository } from "../../src/repositories/StationRepository.js";
import { connectMongoTest, closeMongoTest, getTestDb } from "../utils/mongo.js";
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

describe("StationRepository", () => {
  let repository: StationRepository;

  beforeAll(async () => {
    await connectMongoTest();
    const db = getTestDb();
    repository = new StationRepository(db.collection("stations"));
  });

  afterAll(closeMongoTest);

  beforeEach(async () => {
    const db = getTestDb();
    await db.collection("stations").deleteMany({});
  });

  it("should save and retrieve correctly", async () => {
    const station = aStation();
    await repository.bulkUpsertById([station]);
    const savedStation = await repository.findOne({ id: station.id });
    
    if (!savedStation) {
      throw new Error("Saved station is null");
    }
    expect(savedStation.id).toEqual(station.id);
  });

  it("should be able to save in bulk an upsert", async () => {
    const stations = range(4).map(aStation);
    await repository.bulkUpsertById(stations);
    await repository.bulkUpsertById(stations);
    const savedStations = await repository.find({});
    expect(savedStations.length).toEqual(4);
  });

  describe("findNearestByCoordinates", () => {
    beforeEach(async () => {
      // Ensure 2dsphere index exists for tests
      const db = getTestDb();
      await db.collection("stations").createIndex({ location: "2dsphere" });
    });

    it("should retrieve nearest stations by coordinates", async () => {
      const stations = range(4).map((i) => {
        const s = aStation(i + 1);
        // Vary coordinates to ensure distance-based sorting
        s.location.coordinates = [2.0 + i * 0.1, 1.0 + i * 0.1];
        return s;
      });
      await repository.bulkUpsertById(stations);
      const nearest = await repository.findNearestByCoordinates(1.0, 2.0, 2);
      expect(nearest.length).toEqual(2);
      expect(nearest[0].id).toEqual(1);
    });

    it("should populate fuelTypeEnum for gasoline", async () => {
      const stations = range(5).map((i) => aStation(i + 1));
      stations[0].prices[0].fuelType = "Benzina";
      stations[1].prices[0].fuelType = "BENZINA";
      stations[2].prices[0].fuelType = "benzina";
      stations[3].prices[0].fuelType = "Benzina HQ";
      stations[4].prices[0].fuelType = "Hi-Q Benzina";
      await repository.bulkUpsertById(stations);
      const results = await repository.findNearestByCoordinates(1.0, 2.0, 5);
      results.forEach((s) =>
        expect(s.prices[0].fuelTypeEnum).toEqual(FuelTypeEnum.GASOLINE),
      );
    });

    it("should filter out stations that have too old prices", async () => {
      const station = aStation();
      station.prices[0].updatedAt = moment().subtract(7, "months").toDate();
      await repository.bulkUpsertById([station]);
      const results = await repository.findNearestByCoordinates(1.0, 2.0, 2);
      expect(results.length).toEqual(0);
    });

    it("should not filter out stations that have at least one price updated", async () => {
      const station = aStation();
      station.prices.push({
        ...aPrice(),
        updatedAt: moment().subtract(20, "days").toDate(),
      });
      station.prices[0].updatedAt = moment().subtract(7, "months").toDate();
      await repository.bulkUpsertById([station]);
      const results = await repository.findNearestByCoordinates(1.0, 2.0, 2);
      expect(results.length).toEqual(1);
    });
  });

  it("should populate fuelTypeEnum for diesel", async () => {
    const stations = range(7).map((i) => aStation(i + 1));
    stations[0].prices[0].fuelType = "Diesel";
    stations[1].prices[0].fuelType = "DIESEL";
    stations[2].prices[0].fuelType = "Hi-Q Diesel";
    stations[3].prices[0].fuelType = "Gasolio";
    stations[4].prices[0].fuelType = "GASOLIO";
    stations[5].prices[0].fuelType = "GASOLIO HQ";
    stations[6].prices[0].fuelType = "Super";
    
    // Ensure 2dsphere index exists
    const db = getTestDb();
    await db.collection("stations").createIndex({ location: "2dsphere" });
    
    await repository.bulkUpsertById(stations);
    const results = await repository.findNearestByCoordinates(1.0, 2.0, 7);
    results.forEach((s) =>
      expect(s.prices[0].fuelTypeEnum).toEqual(FuelTypeEnum.DIESEL),
    );
  });

  it("should get by ids", async () => {
    // Ensure index for findNearest (if used internally, though findByIds doesn't need it)
    await repository.bulkUpsertById(range(5).map((i) => aStation(i + 1)));
    const ids = [1, 2];
    const stations = await repository.findByIds(ids);
    expect(stations.length).toBe(ids.length);
    stations.forEach((s) => expect(ids.includes(s.id)));
  });
});
