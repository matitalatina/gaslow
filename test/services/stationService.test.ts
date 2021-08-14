import { Station, IStation } from "./../../src/models/Station";
import { StationService } from "./../../src/services/stationService";
import { PriceParser } from "./../../src/parsers/priceParser";
import { StringDownloader } from "./../../src/fetchers/stringDownloader";
import { createSandbox } from "sinon";
import { mock, reset, instance, when } from "ts-mockito";
import StationParser from "../../src/parsers/stationParser";
import { aStation, aCsvPrice, aCsvStation } from "../utils/fixtures";
import { StationConverter } from "../../src/parsers/stationConverter";
import { GoogleMapsClient } from "../../src/clients/GoogleMapsClient";
import GeoUtil from "../../src/util/geo";
import { polygon } from "@turf/helpers";

const sandbox = createSandbox();
const mockGoogleMapsClient = mock(GoogleMapsClient);
const mockGeoUtil = mock(GeoUtil);
let service: StationService;

describe("StationService", () => {
  beforeEach(() => {
    service = new StationService(
      instance(mockGoogleMapsClient),
      instance(mockGeoUtil),
    );
  });

  afterEach(() => {
    sandbox.restore();
    reset(mockGoogleMapsClient);
  });

  it("should be created", () => {
    expect(StationService).toBeDefined();
  });

  it("should have correct sources", () => {
    expect(StationService.pricesSource).toEqual("https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv");
    expect(StationService.stationsSource).toEqual("https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv");
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
        expect(download.calledWith(StationService.stationsSource)).toEqual(true);
        expect(download.calledWith(StationService.pricesSource)).toEqual(true);
        expect(stationParser.calledOnceWith("stations")).toEqual(true);
        expect(priceParser.calledOnceWith("prices")).toEqual(true);
        expect(stationConverter.calledOnceWith([aCsvStation()], [aCsvPrice()]));
        expect(station.called).toEqual(true);
      });
  });

  it("should find nearest stations given lat and lng", () => {
    const returnedStation = aStation();
    const stationFind = sandbox.stub(Station, "findNearestByCoordinates")
      .resolves([returnedStation]);
    return StationService.findNearestByCoordinates(1.0, 2.0)
      .then(([station]: IStation[]) => {
        expect(station.id).toEqual(returnedStation.id);
      });
  });

  it("should find on the route", async () => {
    const returnedStation = aStation();
    const from = {lat: 1.0, lng: 2.0};
    const to = {lat: 3.0, lng: 4.0};
    const polyline = "encoded_polyline";
    const featurePolygon = polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: "poly1" }).geometry;
    when(mockGoogleMapsClient.getPolylineByRoute(from, to)).thenResolve(polyline);
    when(mockGeoUtil.fromPolylineToPolygon(polyline)).thenReturn(featurePolygon);
    const stubFindWithinPolygon = sandbox.stub(Station, "findWithinPolygon")
      .resolves([returnedStation]);

    await service.findOnTheRoute(from, to);

    expect(stubFindWithinPolygon.getCall(0).args[0]).toEqual(featurePolygon);
  });
});