import type { Readable } from "node:stream";
import { CsvDownloader } from "./csvDownloader.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../di/types.js";

@injectable()
export class StationDownloader {
  constructor(
    @inject(TYPES.CsvDownloader)
    private readonly csvDownloader: CsvDownloader,
  ) {}

  async download(signal?: AbortSignal): Promise<Readable> {
    const stationsSource: string =
      "https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";
    return this.csvDownloader.download(stationsSource, signal);
  }
}
