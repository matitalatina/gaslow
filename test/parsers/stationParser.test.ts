import type { CsvStation } from "../../src/parsers/models/csvStation.js";
import { StationParser } from "../../src/parsers/stationParser.js";
import { getFileAsString } from "../utils/files.js";
import { describe, it, expect, beforeEach } from "vitest";

describe("StationParser", () => {
  let parsedStations: Promise<Array<CsvStation>>;
  let stationParser: StationParser;

  beforeEach(() => {
    stationParser = new StationParser();
    parsedStations = getFileAsString(
      "test/resources/anagrafica_impianti_attivi.csv",
    ).then((csvString) => stationParser.parse(csvString));
  });

  it("should parse the csv skipping the first two lines and possible errors", async () => {
    const csvLines = await parsedStations;
    console.log(csvLines);
    expect(csvLines.length).toEqual(4);
  });

  it("should parse correctly the station", async () => {
    const stations = await parsedStations;
    const firstStation = stations[0];
    expect(firstStation.id).toEqual(3471);
    expect(firstStation.manager).toEqual("MATTESINI MATTEO & C. S.N.C.");
    expect(firstStation.brand).toEqual("Api-Ip");
    expect(firstStation.type).toEqual("Autostradale");
    expect(firstStation.name).toEqual("BADIA AL PINO OVEST");
    expect(firstStation.address).toEqual(
      "Autostrada A1 MILANO-NAPOLI, Km. 362+300, dir. Sud - 52041",
    );
    expect(firstStation.city).toEqual("CIVITELLA IN VAL DI CHIANA");
    expect(firstStation.province).toEqual("AR");
    expect(firstStation.latitude).toEqual(43.40652172181852);
    expect(firstStation.longitude).toEqual(11.762473472213742);
  });
  it("should parse correctly the station with html entities", async () => {
    const stations = await parsedStations;
    const firstStation = stations[3];
    expect(firstStation.id).toEqual(23777);
    expect(firstStation.manager).toEqual(
      "A. Di Benedetto srl V.le C. Alberto Canicatti",
    );
    expect(firstStation.brand).toEqual("Sicilpetroli");
    expect(firstStation.type).toEqual("Stradale");
    expect(firstStation.name).toEqual(
      "A. Di Benedetto srl V.le C. Alberto Canicatti",
    );
    expect(firstStation.address).toEqual(
      "VIA VIALE CARLO ALBERTO S.N. 92024, CANICATTI; (AG) SNC 92024",
    );
    expect(firstStation.city).toEqual("CANICATTI'");
    expect(firstStation.province).toEqual("AG");
    expect(firstStation.latitude).toEqual(37.36246631312339);
    expect(firstStation.longitude).toEqual(13.8555327218387);
  });
});
