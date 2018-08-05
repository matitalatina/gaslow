import { StationService } from "./../../src/services/stationService";
import { Station, IStation } from "./../../src/models/Station";
import { aStation } from "../utils/fixtures";

import chai from "chai";
import { connectMongoTest, closeMongoTest } from "../utils/mongo";
import { range } from "lodash";

const expect = chai.expect;

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
          expect(savedStation.id).to.be.eq(station.id);
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
        expect(savedStations.length).to.be.eq(4);
      });
  });

  it("should prevent two stations with same id", () => {
    return aStation().save()
      .then(() => aStation().save())
      .then(() => fail("it should fail!"))
      .catch((err) => {
        expect(err.message).to.contain("duplicate key");
      });
  });

  it("should have mandatory fields", () => {
    return new Station({ prices: [{}] }).validate()
      .then(() => fail("model is not valid!"))
      .catch((err) => {
        expect(err.errors.id).to.be.exist;
        expect(err.errors.name).to.be.exist;
        expect(err.errors.address).to.be.exist;
        expect(err.errors["location.type"]).to.be.exist;
        expect(err.errors["prices.0.fuelType"]).to.be.exist;
        expect(err.errors["prices.0.price"]).to.be.exist;
        expect(err.errors["prices.0.isSelf"]).to.be.exist;
        expect(err.errors["prices.0.updatedAt"]).to.be.exist;
        expect(err.errors.city).to.be.exist;
        expect(err.errors.province).to.be.exist;
      });
  });

  it("should retrieve nearest stations by coordinates", () => {
    const stations = range(4)
      .map(aStation);
    return Station.bulkUpsertById(stations)
      .then(() => Station.findNearestByCoordinates(1.0, 2.0, 2))
      .then((stations: IStation[]) => {
        expect(stations.length).to.be.eq(2);
        expect(stations[0].id).to.be.eq(1);
      });
  });

  it.skip("should work (full path)", () => {
    return StationService.updateStationCollection()
      .catch((err) => {
        console.log(err);
      });
  });
});