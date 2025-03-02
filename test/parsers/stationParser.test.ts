import { CsvStation } from "../../src/parsers/models/csvStation";
import { StationParser } from "../../src/parsers/stationParser";
import { getFileAsString } from "../utils/files";
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("StationParser", () => {
  let parsedStations: Promise<Array<CsvStation>>;
  let stationParser: StationParser;

  beforeEach(() => {
    stationParser = new StationParser();
    parsedStations = getFileAsString(
      "test/resources/anagrafica_impianti_attivi.csv",
    ).then((csvString) => stationParser.parse(csvString));
  });

  it("should parse the csv skipping the first two lines and possible errors", (done) => {
    parsedStations.then((csvLines) => {
      expect(csvLines.length).toEqual(4);
      done();
    });
  });

  it("should parse correctly the station", (done) => {
    parsedStations.then((stations) => {
      const firstStation = stations[0];
      expect(firstStation.id).toEqual(3464);
      expect(firstStation.manager).toEqual(
        "STAZ.SERV.PO EST ANDREOTTI CLAUDIO DI ANDREOTTI OMAR E C. SNC",
      );
      expect(firstStation.brand).toEqual("Total Erg");
      expect(firstStation.type).toEqual("Autostradale");
      expect(firstStation.name).toEqual("PO EST");
      expect(firstStation.address).toEqual(
        "Autostrada A13 BOLOGNA-PADOVA, Km. 43+400, dir. Nord 44100",
      );
      expect(firstStation.city).toEqual("FERRARA");
      expect(firstStation.province).toEqual("FE");
      expect(firstStation.latitude).toEqual(44.88011856623546);
      expect(firstStation.longitude).toEqual(11.570832944774565);
      done();
    });
  });
  it("should parse correctly the station with html entities", (done) => {
    parsedStations.then((stations) => {
      const firstStation = stations[3];
      expect(firstStation.id).toEqual(23777);
      expect(firstStation.manager).toEqual(
        "ALFONSO DI BENEDETTO CARBURANTI LUBRIFICANTI SRL",
      );
      expect(firstStation.brand).toEqual("Sicilpetroli");
      expect(firstStation.type).toEqual("Stradale");
      expect(firstStation.name).toEqual(
        "A. Di Benedetto srl V.le C. Alberto Canicatti",
      );
      expect(firstStation.address).toEqual(
        "VIA VIALE CARLO ALBERTO S.N. 92024, CANICATTI' (AG) SNC 92024",
      );
      expect(firstStation.city).toEqual("CANICATTI'");
      expect(firstStation.province).toEqual("AG");
      expect(firstStation.latitude).toEqual(37.36246631312339);
      expect(firstStation.longitude).toEqual(13.8555327218387);
      done();
    });
  });
});
