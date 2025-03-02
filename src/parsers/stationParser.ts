import { parseCsvSkip2Lines } from "./csvUtils";
import { CsvStation } from "./models/csvStation";
import { injectable } from "inversify";

@injectable()
export class StationParser {
  parse(csv: string): Promise<Array<CsvStation>> {
    return parseCsvSkip2Lines(csv).then((csvLines) =>
      csvLines.map((row) => ({
        id: parseInt(row[0], 10),
        manager: row[1],
        brand: row[2],
        type: row[3],
        name: row[4],
        address: row[5],
        city: row[6],
        province: row[7],
        latitude: row[8] !== "NULL" ? parseFloat(row[8]) : undefined,
        longitude: row[9] !== "NULL" ? parseFloat(row[9]) : undefined,
      })),
    );
  }
}
