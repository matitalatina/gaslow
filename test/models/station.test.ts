import { Station } from "./../../src/models/Station";
import { aStation } from "../utils/fixtures";

import chai from "chai";
import { doesNotThrow } from "assert";
import { connectMongoTest, closeMongoTest } from "../utils/mongo";

const expect = chai.expect;

describe("Station", () => {
  beforeAll(connectMongoTest);
  afterAll(closeMongoTest);

  beforeEach(() => {
      return Station.remove({}).exec()
      .catch(e => {
        console.log(e);
      });
  });

  it("should save and retrieve correctly", (done) => {
    const station = aStation();
    station.save();
    Station.findOne({ id: station.id }).exec()
      .then((savedStation) => {
        expect(savedStation.id).to.be.eq(station.id);
        done();
      })
      .catch(e => {
        console.log(e);
        done();
      });
  });
});