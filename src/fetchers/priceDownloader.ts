import { TYPES } from "../di/types.js";
import { StringDownloader } from "./stringDownloader.js";
import { inject, injectable } from "inversify";

@injectable()
export class PriceDownloader {
  constructor(
    @inject(TYPES.StringDownloader)
    private readonly stringDownloader: StringDownloader,
  ) {}

  async download(): Promise<string> {
    const pricesSource: string =
      "https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv";

    return this.stringDownloader.download(pricesSource);
  }
}
