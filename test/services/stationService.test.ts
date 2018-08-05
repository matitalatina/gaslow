import { Station, IStation } from "./../../src/models/Station";
import { StationService } from "./../../src/services/stationService";
import { PriceParser } from "./../../src/parsers/priceParser";
import { StringDownloader } from "./../../src/fetchers/stringDownloader";
import { expect } from "chai";
import { createSandbox } from "sinon";
import StationParser from "../../src/parsers/stationParser";
import { aStation, aCsvPrice, aCsvStation } from "../utils/fixtures";
import { StationConverter } from "../../src/parsers/stationConverter";

const sandbox = createSandbox();

describe("StationService", () => {
  afterEach(() => {
    sandbox.restore();
  });

  it("should be created", () => {
    expect(StationService).to.be.exist;
  });

  it("should have correct sources", () => {
    expect(StationService.pricesSource).to.be.eq("http://www.sviluppoeconomico.gov.it/images/exportCSV/prezzo_alle_8.csv");
    expect(StationService.stationsSource).to.be.eq("http://www.sviluppoeconomico.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv");
  });

  it("should download and update DB with new data", () => {
    const download = sandbox.stub(StringDownloader, "download");

    download.withArgs(StationService.pricesSource)
      .returns(Promise.resolve("prices"));
    download.withArgs(StationService.stationsSource)
      .returns(Promise.resolve("stations"));

    const stationParser = sandbox.stub(StationParser, "parse")
      .returns(Promise.resolve([aCsvStation()]));

    const priceParser = sandbox.stub(PriceParser, "parse")
      .returns(Promise.resolve([aCsvPrice()]));

    const stationConverter = sandbox.stub(StationConverter, "merge")
      .returns([aStation()]);

    const station = sandbox.stub(Station, "bulkUpsertById").returns(undefined);

    return StationService.updateStationCollection()
      .then(() => {
        download.args;
        expect(download.calledWith(StationService.stationsSource)).to.be.true;
        expect(download.calledWith(StationService.pricesSource)).to.be.true;
        expect(stationParser.calledOnceWith("stations")).to.be.true;
        expect(priceParser.calledOnceWith("prices")).to.be.true;
        expect(stationConverter.calledOnceWith([aCsvStation()], [aCsvPrice()]));
        expect(station.called).to.be.true;
      });
  });

  it("should find nearest stations given lat and lng", () => {
    const returnedStation = aStation();
    const stationFind = sandbox.stub(Station, "findNearestByCoordinates")
      .returns(Promise.resolve([returnedStation]));
    return StationService.findNearestByCoordinates(1.0, 2.0)
      .then(([station]: IStation[]) => {
        expect(station.id).to.be.eq(returnedStation.id);
      });
  });
});