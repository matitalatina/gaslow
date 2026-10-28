import { decode } from "html-entities";
import { parseCsvSkip2Lines } from "./csvUtils.js";
import type { CsvStation } from "./models/csvStation.js";
import { injectable } from "inversify";
import type { Readable } from "node:stream";

@injectable()
export class StationParser {
  async *parseStream(csv: string | Readable): AsyncGenerator<CsvStation> {
    for await (const row of parseCsvSkip2Lines(csv)) {
      yield {
        id: parseInt(row[0], 10),
        manager: decode(row[1]),
        brand: decode(row[2]),
        type: decode(row[3]),
        name: decode(row[4]),
        address: decode(row[5]),
        city: decode(row[6]),
        province: decode(row[7]),
        latitude: row[8] !== "NULL" ? parseFloat(row[8]) : undefined,
        longitude: row[9] !== "NULL" ? parseFloat(row[9]) : undefined,
      };
    }
  }

  async parse(csv: string | Readable): Promise<Array<CsvStation>> {
    const stations: Array<CsvStation> = [];
    for await (const station of this.parseStream(csv)) {
      stations.push(station);
    }
    return stations;
  }
}
