import { mock, reset, instance, when, verify, deepEqual } from "ts-mockito";
import { polygon } from "@turf/helpers";
import { StationService } from "../../src/services/stationService";
import { aStation, aCsvPrice, aCsvStation } from "../utils/fixtures";
import { StationConverter } from "../../src/parsers/stationConverter";
import { GoogleMapsClient } from "../../src/clients/GoogleMapsClient";
import GeoUtil from "../../src/util/geo";
import { range } from "lodash";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { BulkWriteResult } from "mongodb";
import { IStationModelProvider } from "../../src/models/StationModelProvider";
import { PriceDownloader } from "../../src/fetchers/priceDownloader";
import { StationDownloader } from "../../src/fetchers/stationDownloader";

const mockGoogleMapsClient = mock(GoogleMapsClient);
const mockGeoUtil = mock(GeoUtil);
const mockStationModelProvider = mock<IStationModelProvider>();
const mockPriceDownloader = mock(PriceDownloader);
const mockStationDownloader = mock(StationDownloader);
const mockStationConverter = mock(StationConverter);
let service: StationService;

describe("StationService", () => {
  beforeEach(() => {
    reset(mockGoogleMapsClient);
    reset(mockGeoUtil);
    reset(mockStationModelProvider);
    reset(mockPriceDownloader);
    reset(mockStationDownloader);
    reset(mockStationConverter);

    service = new StationService(
      instance(mockGoogleMapsClient),
      instance(mockGeoUtil),
      instance(mockStationModelProvider),
      instance(mockPriceDownloader),
      instance(mockStationDownloader),
      instance(mockStationConverter),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be created", () => {
    expect(StationService).toBeDefined();
  });

  it("should download and update DB with new data", async () => {
    const csvStations = [aCsvStation()];
    const csvPrices = [aCsvPrice()];
    const mergedStations = [aStation()];

    // Mock the downloader methods
    when(mockStationDownloader.download()).thenResolve(csvStations);
    when(mockPriceDownloader.download()).thenResolve(csvPrices);

    // Mock the StationConverter.merge method
    when(
      mockStationConverter.merge(deepEqual(csvStations), deepEqual(csvPrices)),
    ).thenReturn(mergedStations);

    // Use ts-mockito to mock the bulkUpsertById method with a proper BulkWriteResult
    const bulkWriteResult = {
      acknowledged: true,
      insertedCount: 0,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 1,
      upsertedIds: { "0": "1" },
    } as unknown as BulkWriteResult;

    when(
      mockStationModelProvider.bulkUpsertById(deepEqual(mergedStations)),
    ).thenResolve(bulkWriteResult);

    await service.updateStationCollection();

    // Verify that the downloader methods were called
    verify(mockStationDownloader.download()).once();
    verify(mockPriceDownloader.download()).once();

    // Verify that the StationConverter.merge method was called with the correct arguments
    verify(
      mockStationConverter.merge(deepEqual(csvStations), deepEqual(csvPrices)),
    ).once();

    // Verify that bulkUpsertById was called with the correct arguments
    verify(
      mockStationModelProvider.bulkUpsertById(deepEqual(mergedStations)),
    ).once();
  });

  it("should find nearest stations given lat and lng", async () => {
    const returnedStations = [aStation()];

    // Mock the findNearestByCoordinates method to return the stations
    when(
      mockStationModelProvider.findNearestByCoordinates(1.0, 2.0),
    ).thenResolve(returnedStations);

    // Call the service method
    const result = await service.findNearestByCoordinates(1.0, 2.0);

    // Verify the result and that the mock was called
    expect(result).toEqual(returnedStations);
    verify(mockStationModelProvider.findNearestByCoordinates(1.0, 2.0)).once();
  });

  it("should find by ids", async () => {
    const returnedStations = range(2).map(aStation);
    const ids = [1, 2];

    // Mock the findByIds method
    when(mockStationModelProvider.findByIds(deepEqual(ids))).thenResolve(
      returnedStations,
    );

    // Call the service method
    const result = await service.findByIds(ids);

    // Verify the result and that the mock was called
    expect(result).toEqual(returnedStations);
    verify(mockStationModelProvider.findByIds(deepEqual(ids))).once();
  });

  it("should find on the route", async () => {
    const returnedStations = [aStation()];
    const from = { lat: 1.0, lng: 2.0 };
    const to = { lat: 3.0, lng: 4.0 };
    const polyline = "encoded_polyline";
    const featurePolygon = polygon(
      [
        [
          [-5, 52],
          [-4, 56],
          [-2, 51],
          [-7, 54],
          [-5, 52],
        ],
      ],
      { name: "poly1" },
    ).geometry;

    // Mock the getPolylineByRoute method
    when(
      mockGoogleMapsClient.getPolylineByRoute(deepEqual(from), deepEqual(to)),
    ).thenResolve(polyline);

    // Mock the fromPolylineToPolygon method
    when(mockGeoUtil.fromPolylineToPolygon(polyline)).thenReturn(
      featurePolygon,
    );

    // Mock the findWithinPolygon method
    when(
      mockStationModelProvider.findWithinPolygon(deepEqual(featurePolygon)),
    ).thenResolve(returnedStations);

    // Call the service method
    const result = await service.findOnTheRoute(from, to);

    // Verify the result and that the mocks were called
    expect(result).toEqual(returnedStations);
    verify(
      mockGoogleMapsClient.getPolylineByRoute(deepEqual(from), deepEqual(to)),
    ).once();
    verify(mockGeoUtil.fromPolylineToPolygon(polyline)).once();
    verify(
      mockStationModelProvider.findWithinPolygon(deepEqual(featurePolygon)),
    ).once();
  });
});
