import type { Readable } from "node:stream";
import { TYPES } from "../di/types.js";
import { CsvDownloader } from "./csvDownloader.js";
import { inject, injectable } from "inversify";

@injectable()
export class PriceDownloader {
  constructor(
    @inject(TYPES.CsvDownloader)
    private readonly csvDownloader: CsvDownloader,
  ) {}

  async download(signal?: AbortSignal): Promise<Readable> {
    const pricesSource: string =
      "https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv";

    return this.csvDownloader.download(pricesSource, signal);
  }
}
