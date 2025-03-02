import { CsvStation } from "../parsers/models/csvStation";
import { StationParser } from "../parsers/stationParser";
import { StringDownloader } from "./stringDownloader";
import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";

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
