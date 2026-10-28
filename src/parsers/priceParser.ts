import moment from "moment";
import { decode } from "html-entities";
import type { CsvPrice } from "./models/csvPrice.js";
import { parseCsvSkip2Lines } from "./csvUtils.js";
import { injectable } from "inversify";

@injectable()
export class PriceParser {
  async *parseStream(csv: string): AsyncGenerator<CsvPrice> {
    for await (const row of parseCsvSkip2Lines(csv)) {
      yield {
        idStation: parseInt(row[0], 10),
        fuelType: decode(row[1]),
        price: parseFloat(row[2]),
        isSelf: row[3] === "1",
        updatedAt: moment(row[4], "DD/MM/YYYY HH:mm:ss").toDate(),
      };
    }
  }

  async parse(csv: string): Promise<Array<CsvPrice>> {
    const prices: Array<CsvPrice> = [];
    for await (const price of this.parseStream(csv)) {
      prices.push(price);
    }
    return prices;
  }
}
