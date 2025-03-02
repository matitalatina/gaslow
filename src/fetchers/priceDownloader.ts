import { CsvPrice } from "../parsers/models/csvPrice";
import { PriceParser } from "../parsers/priceParser";
import { StringDownloader } from "./stringDownloader";
import { injectable } from "inversify";

@injectable()
export class PriceDownloader {
  async download(): Promise<CsvPrice[]> {
    const pricesSource: string =
      "https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv";

    return StringDownloader.download(pricesSource).then(PriceParser.parse);
  }
}
