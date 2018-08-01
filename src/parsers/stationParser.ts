import { parseCsvSkip2Lines } from "./csvUtils";
import { CsvStation } from "./models/csvStation";

export default class StationParser {
  parse(csv: string): Promise<Array<CsvStation>> {
    return parseCsvSkip2Lines(csv)
      .then((csvLines) => csvLines.map(row => ({
        id: parseInt(row[0]),
        manager: row[1],
        brand: row[2],
        type: row[3],
        name: row[4],
        address: row[5],
        city: row[6],
        province: row[7],
        latitude: parseFloat(row[8]),
        longitude: parseFloat(row[9]),
      })));
  }
}