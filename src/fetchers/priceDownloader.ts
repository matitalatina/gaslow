import { TYPES } from "../di/types";
import { CsvPrice } from "../parsers/models/csvPrice";
import { PriceParser } from "../parsers/priceParser";
import { StringDownloader } from "./stringDownloader";
import { inject, injectable } from "inversify";

@injectable()
export class PriceDownloader {
  constructor(
    @inject(TYPES.StringDownloader)
    private readonly stringDownloader: StringDownloader,
    @inject(TYPES.PriceParser) private readonly priceParser: PriceParser,
  ) {}

  async download(): Promise<CsvPrice[]> {
    const pricesSource: string =
      "https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv";

    return this.stringDownloader
      .download(pricesSource)
      .then(this.priceParser.parse);
  }
}
