import { StationService } from "./../../src/services/stationService";
import { Station, IStation, FuelTypeEnum } from "./../../src/models/Station";
import { aStation, aPrice } from "../utils/fixtures";

import { connectMongoTest, closeMongoTest } from "../utils/mongo";
import { range } from "lodash";
import moment = require("moment");


describe("Station", () => {
  beforeAll(connectMongoTest);
  afterAll(closeMongoTest);

  beforeEach(() => {
    return Station.remove({}).exec();
  });

  it("should save and retrieve correctly", () => {
    const station = aStation();
    return station.save().then(() => {
      return Station.findOne({ id: station.id }).exec()
        .then((savedStation) => {
          expect(savedStation.id).toEqual(station.id);
        });
    });
  });

  it("should be able to save in bulk an upsert", () => {
    const stations = range(4)
      .map(aStation);
    return Station.bulkUpsertById(stations)
      .then(() => Station.bulkUpsertById(stations))
      .then(() => Station.find({}).exec())
      .then((savedStations) => {
        expect(savedStations.length).toEqual(4);
      });
  });

  it("should prevent two stations with same id", () => {
    return aStation().save()
      .then(() => aStation().save())
      .then(() => fail("it should fail!"))
      .catch((err) => {
        expect(err.message).toContain("duplicate key");
      });
  });

  it("should have mandatory fields", () => {
    return new Station({ prices: [{}] }).validate()
      .then(() => fail("model is not valid!"))
      .catch((err) => {
        expect(err.errors.id).toBeDefined();
        expect(err.errors.name).toBeDefined();
        expect(err.errors.address).toBeDefined();
        expect(err.errors["location.type"]).toBeDefined();
        expect(err.errors["prices.0.fuelType"]).toBeDefined();
        expect(err.errors["prices.0.price"]).toBeDefined();
        expect(err.errors["prices.0.isSelf"]).toBeDefined();
        expect(err.errors["prices.0.updatedAt"]).toBeDefined();
        expect(err.errors.city).toBeDefined();
        expect(err.errors.province).toBeDefined();
      });
  });

  describe("findNearestByCoordinates", () => {
    it("should retrieve nearest stations by coordinates", () => {
      const stations = range(4)
        .map(aStation);
      return Station.bulkUpsertById(stations)
        .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
        .then((stations: IStation[]) => {
          expect(stations.length).toEqual(2);
          expect(stations[0].id).toEqual(1);
        });
    });

    it("should populate fuelTypeEnum for gasoline", () => {
      const stations = range(5).map(aStation);
      stations[0].prices[0].fuelType = "Benzina";
      stations[1].prices[0].fuelType = "BENZINA";
      stations[2].prices[0].fuelType = "benzina";
      stations[3].prices[0].fuelType = "Benzina HQ";
      stations[4].prices[0].fuelType = "Hi-Q Benzina";
      return Station.bulkUpsertById(stations)
        .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
        .then((ss) => ss.forEach(s => expect(s.prices[0].fuelTypeEnum).toEqual(FuelTypeEnum.GASOLINE)));
    });

    it("should filter out stations that have too old prices", () => {
      const station = aStation();
      station.prices[0].updatedAt = moment().add(-7, "months").toDate();
      return Station.bulkUpsertById([station])
        .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
        .then((ss) => expect(ss.length).toEqual(0));
    });

    it("should not filter out stations that have at least one price updated", () => {
      const station = aStation();
      station.prices.push({...aPrice(), updatedAt: moment().add(-20, "days").toDate()});
      station.prices[0].updatedAt = moment().add(-7, "months").toDate();
      return Station.bulkUpsertById([station])
        .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
        .then((ss) => expect(ss.length).toEqual(1));
    });
  });

  it("should populate fuelTypeEnum for diesel", () => {
    const stations = range(7).map(aStation);
    stations[0].prices[0].fuelType = "Diesel";
    stations[1].prices[0].fuelType = "DIESEL";
    stations[2].prices[0].fuelType = "Hi-Q Diesel";
    stations[3].prices[0].fuelType = "Gasolio";
    stations[4].prices[0].fuelType = "GASOLIO";
    stations[5].prices[0].fuelType = "GASOLIO HQ";
    stations[6].prices[0].fuelType = "Super";
    return Station.bulkUpsertById(stations)
      .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
      .then((ss) => ss.forEach(s => expect(s.prices[0].fuelTypeEnum).toEqual(FuelTypeEnum.DIESEL)));
  });

  it("should populate fuelTypeEnum for other", () => {
    const stations = range(5).map(aStation);
    stations[0].prices[0].fuelType = "GPL";
    stations[1].prices[0].fuelType = "gpl";
    stations[2].prices[0].fuelType = "Metano";
    stations[3].prices[0].fuelType = "METANO";
    stations[4].prices[0].fuelType = "Metano HQ";
    stations[4].prices[0].fuelType = "";
    stations[4].prices[0].fuelType = undefined;
    return Station.bulkUpsertById(stations)
      .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
      .then((ss) => ss.forEach(s => expect(s.prices[0].fuelTypeEnum).toEqual(FuelTypeEnum.OTHER)));
  });

  it("should add fuelTypeEnum to JSON", () => {
    const station = aStation();
    station.prices[0].fuelType = "Diesel";
    return Station.bulkUpsertById([station])
      .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
      .then((ss) => expect(ss[0].toJSON().prices[0].fuelTypeEnum).toEqual("DIESEL"));
  });


  it.skip("should work (full path)", () => {
    return StationService.updateStationCollection()
      .catch((err) => {
        console.log(err);
      });
  });
});
