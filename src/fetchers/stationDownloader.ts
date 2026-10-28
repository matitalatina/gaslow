import { StringDownloader } from "./stringDownloader.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../di/types.js";

@injectable()
export class StationDownloader {
  constructor(
    @inject(TYPES.StringDownloader)
    private readonly stringDownloader: StringDownloader,
  ) {}

  async download(): Promise<string> {
    const stationsSource: string =
      "https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";
    return this.stringDownloader.download(stationsSource);
  }
}
