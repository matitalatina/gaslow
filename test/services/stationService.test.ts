import {
  mock,
  reset,
  instance,
  when,
  verify,
  deepEqual,
  anything,
} from "ts-mockito";
import { polygon } from "@turf/helpers";
import { StationService } from "../../src/services/stationService.js";
import { aStation } from "../utils/fixtures.js";
import { StationConverter } from "../../src/parsers/stationConverter.js";
import { GoogleMapsClient } from "../../src/clients/GoogleMapsClient.js";
import GeoUtil from "../../src/util/geo.js";
import { range } from "lodash-es";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { IStationRepository } from "../../src/repositories/StationRepository.js";
import { PriceDownloader } from "../../src/fetchers/priceDownloader.js";
import { StationDownloader } from "../../src/fetchers/stationDownloader.js";
import { StationParser } from "../../src/parsers/stationParser.js";
import { PriceParser } from "../../src/parsers/priceParser.js";

const mockGoogleMapsClient = mock(GoogleMapsClient);
const mockGeoUtil = mock(GeoUtil);
const mockStationRepository = mock<IStationRepository>();
const mockPriceDownloader = mock(PriceDownloader);
const mockStationDownloader = mock(StationDownloader);
const mockStationConverter = mock(StationConverter);
const stationParser = new StationParser();
const priceParser = new PriceParser();
let service: StationService;

const stationCsv = [
  "Estrazione del 2026-10-26",
  "idImpianto|Gestore|Bandiera|Tipo Impianto|Nome Impianto|Indirizzo|Comune|Provincia|Latitudine|Longitudine",
  "1|manager|brand|type|name|address|city|province|1|2",
].join("\n");
const priceCsv = [
  "Estrazione del 2026-10-26",
  "idImpianto|descCarburante|prezzo|isSelf|dtComu",
  "1|Benzina|1.5|1|12/03/2026 16:30:11",
].join("\n");

describe("StationService", () => {
  beforeEach(() => {
    reset(mockGoogleMapsClient);
    reset(mockGeoUtil);
    reset(mockStationRepository);
    reset(mockPriceDownloader);
    reset(mockStationDownloader);
    reset(mockStationConverter);

    service = new StationService(
      instance(mockGoogleMapsClient),
      instance(mockGeoUtil),
      instance(mockStationRepository),
      instance(mockPriceDownloader),
      instance(mockStationDownloader),
      instance(mockStationConverter),
      stationParser,
      priceParser,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should be created", () => {
    expect(StationService).toBeDefined();
  });

  it("should download and update DB with new data", async () => {
    const mergedStations = [aStation()];

    // Mock the downloader methods
    when(mockStationDownloader.download()).thenResolve(stationCsv);
    when(mockPriceDownloader.download()).thenResolve(priceCsv);

    // Mock the StationConverter.merge method
    when(mockStationConverter.merge(anything(), anything())).thenResolve(
      mergedStations,
    );

    when(
      mockStationRepository.bulkUpsertById(deepEqual(mergedStations)),
    ).thenResolve();

    await service.updateStationCollection();

    // Verify that the downloader methods were called
    verify(mockStationDownloader.download()).once();
    verify(mockPriceDownloader.download()).once();

    // Verify that the StationConverter.merge method was called
    verify(mockStationConverter.merge(anything(), anything())).once();

    // Verify that bulkUpsertById was called with the correct arguments
    verify(
      mockStationRepository.bulkUpsertById(deepEqual(mergedStations)),
    ).once();
  });

  it("should run only one update at a time", async () => {
    const mergedStations = [aStation()];

    when(mockStationDownloader.download()).thenResolve(stationCsv);
    when(mockPriceDownloader.download()).thenResolve(priceCsv);
    when(mockStationConverter.merge(anything(), anything())).thenResolve(
      mergedStations,
    );
    when(
      mockStationRepository.bulkUpsertById(deepEqual(mergedStations)),
    ).thenResolve();

    await Promise.all([
      service.updateStationCollection(),
      service.updateStationCollection(),
    ]);

    verify(mockStationDownloader.download()).once();
    verify(mockPriceDownloader.download()).once();
    verify(mockStationConverter.merge(anything(), anything())).once();
    verify(
      mockStationRepository.bulkUpsertById(deepEqual(mergedStations)),
    ).once();
  });

  it("should resolve only after the database write has finished", async () => {
    const mergedStations = [aStation()];
    let finishWrite: () => void = () => undefined;
    const writePromise = new Promise<void>((resolve) => {
      finishWrite = resolve;
    });

    when(mockStationDownloader.download()).thenResolve(stationCsv);
    when(mockPriceDownloader.download()).thenResolve(priceCsv);
    when(mockStationConverter.merge(anything(), anything())).thenResolve(
      mergedStations,
    );
    when(
      mockStationRepository.bulkUpsertById(deepEqual(mergedStations)),
    ).thenReturn(writePromise);

    let settled = false;
    const update = service.updateStationCollection().then(() => {
      settled = true;
    });

    await new Promise((resolve) => setImmediate(resolve));
    expect(settled).toBe(false);

    finishWrite();
    await update;

    expect(settled).toBe(true);
  });

  it("should find nearest stations given lat and lng", async () => {
    const returnedStations = [aStation()];

    // Mock the findNearestByCoordinates method to return the stations
    when(
      mockStationRepository.findNearestByCoordinates(1.0, 2.0),
    ).thenResolve(returnedStations);

    // Call the service method
    const result = await service.findNearestByCoordinates(1.0, 2.0);

    // Verify the result and that the mock was called
    expect(result).toEqual(returnedStations);
    verify(mockStationRepository.findNearestByCoordinates(1.0, 2.0)).once();
  });

  it("should find by ids", async () => {
    const returnedStations = range(2).map(aStation);
    const ids = [1, 2];

    // Mock the findByIds method
    when(mockStationRepository.findByIds(deepEqual(ids))).thenResolve(
      returnedStations,
    );

    // Call the service method
    const result = await service.findByIds(ids);

    // Verify the result and that the mock was called
    expect(result).toEqual(returnedStations);
    verify(mockStationRepository.findByIds(deepEqual(ids))).once();
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
      mockStationRepository.findWithinPolygon(deepEqual(featurePolygon)),
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
      mockStationRepository.findWithinPolygon(deepEqual(featurePolygon)),
    ).once();
  });
});
