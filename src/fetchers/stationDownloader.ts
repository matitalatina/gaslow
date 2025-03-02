import { CsvStation } from "../parsers/models/csvStation";
import StationParser from "../parsers/stationParser";
import { StringDownloader } from "./stringDownloader";
import { injectable } from "inversify";

@injectable()
export class StationDownloader {
  async download(): Promise<CsvStation[]> {
    const stationsSource: string =
      "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";
    return StringDownloader.download(stationsSource).then(StationParser.parse);
  }
}
