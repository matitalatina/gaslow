import { Station } from "./../../src/models/Station";
import { aStation } from "../utils/fixtures";

import chai from "chai";
import { doesNotThrow } from "assert";

const expect = chai.expect;

describe("Station", () => {
  beforeEach((done) => {
    Station.remove({}).exec()
      .then(() => done())
      .catch(e => {
        console.log(e);
        done();
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