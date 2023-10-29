import moment from "moment";
import { CsvPrice } from "./models/csvPrice";
import { parseCsvSkip2Lines } from "./csvUtils";

export class PriceParser {
  static parse(csv: string): Promise<Array<CsvPrice>> {
    return parseCsvSkip2Lines(csv).then((csvList: Array<string[]>) =>
      csvList.map((csvRow) => ({
        idStation: parseInt(csvRow[0], 10),
        fuelType: csvRow[1],
        price: parseFloat(csvRow[2]),
        isSelf: csvRow[3] === "1",
        updatedAt: moment(csvRow[4], "DD/MM/YYYY HH:mm:ss").toDate(),
      })),
    );
  }
}
