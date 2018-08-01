import { CsvStation } from "./../../src/parsers/models/csvStation";
import StationParser from "../../src/parsers/stationParser";
import { getFileAsString } from "../utils/files";
import chai from "chai";

const expect = chai.expect;

describe("StationParser", () => {
  let parsedStations: Promise<Array<CsvStation>>;

  beforeEach(() => {
    parsedStations = getFileAsString("test/resources/anagrafica_impianti_attivi.csv")
      .then((csvString) => new StationParser().parse(csvString));
  });

  it("should parse the csv skipping the first two lines", (done) => {
    parsedStations
      .then((csvLines) => {
        expect(csvLines.length).to.be.eq(3);
        done();
      });
  });

  it("should parse correctly the station", (done) => {
    parsedStations
      .then((stations) => {
        const firstStation = stations[0];
        expect(firstStation.id).to.be.eq(3464);
        expect(firstStation.manager).to.be.eq("STAZ.SERV.PO EST ANDREOTTI CLAUDIO DI ANDREOTTI OMAR E C. SNC");
        expect(firstStation.brand).to.be.eq("Total Erg");
        expect(firstStation.type).to.be.eq("Autostradale");
        expect(firstStation.name).to.be.eq("PO EST");
        expect(firstStation.address).to.be.eq("Autostrada A13 BOLOGNA-PADOVA, Km. 43+400, dir. Nord 44100");
        expect(firstStation.city).to.be.eq("FERRARA");
        expect(firstStation.province).to.be.eq("FE");
        expect(firstStation.latitude).to.be.eq(44.88011856623546);
        expect(firstStation.longitude).to.be.eq(11.570832944774565);
        done();
      });
  });
});