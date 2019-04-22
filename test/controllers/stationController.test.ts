import { expect } from "chai";
import { createSandbox, assert, SinonStub } from "sinon";
import { StationService } from "../../src/services/stationService";
import { StationsController } from "../../src/controllers/stationController";
import { aStation } from "../utils/fixtures";
import { cleanUpMetadata } from "inversify-express-utils";

const sandbox = createSandbox();

const controller = new StationsController();

describe("StationController", () => {
  beforeEach(() => {
    cleanUpMetadata();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should update stations", () => {
    const updateStationStub = sandbox.stub(StationService, "updateStationCollection").returns(Promise.resolve(undefined));
    const req: any = {};
    const res: any = {
      json: sandbox.stub(),
    };
    return controller.updateStationCollection(req, res).then(() => {
      expect((res.json as sinon.SinonStub).calledOnce).to.be.true;
      expect(updateStationStub.calledOnce).to.be.true;
    });
  });

  it("should findNearestByCoordinates", () => {
    const serviceFind = sandbox.stub(StationService, "findNearestByCoordinates").returns(Promise.resolve([aStation()]));
    const req: any = {
      query: {
        lat: 1.0,
        lng: 2.0,
      }
    };
    const res: any = {
      json: sandbox.stub(),
    };
    return controller.findNearestByCoordinates(req, res)
      .then(() => {
        const jsonStub = (res.json as SinonStub);
        expect(jsonStub.calledOnce).to.be.true;
        expect(jsonStub.args[0][0].items[0].id).to.be.eq(aStation().id);
      });
  });
});