import type { CsvStation } from "../parsers/models/csvStation.js";
import { StationParser } from "../parsers/stationParser.js";
import { StringDownloader } from "./stringDownloader.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../di/types.js";

@injectable()
export class StationDownloader {
  constructor(
    @inject(TYPES.StringDownloader)
    private readonly stringDownloader: StringDownloader,
    @inject(TYPES.StationParser) private readonly stationParser: StationParser,
  ) {}

  async download(): Promise<CsvStation[]> {
    const stationsSource: string =
      "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";
    return this.stringDownloader
      .download(stationsSource)
      .then(this.stationParser.parse);
  }
}
