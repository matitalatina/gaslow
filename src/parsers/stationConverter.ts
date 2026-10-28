import { GeoType } from "../models/Station.js";
import type { Station } from "../models/Station.js";
import type { CsvPrice } from "./models/csvPrice.js";
import type { CsvStation } from "./models/csvStation.js";
import { injectable } from "inversify";

@injectable()
export class StationConverter {
  async merge(
    csvStations: Iterable<CsvStation> | AsyncIterable<CsvStation>,
    csvPrices: Iterable<CsvPrice> | AsyncIterable<CsvPrice>,
  ): Promise<Station[]> {
    const stationsById = new Map<number, Station>();

    for await (const s of csvStations) {
      const { latitude, longitude, ...rest } = s;
      if (!latitude || !longitude) {
        continue;
      }

      stationsById.set(s.id, {
        ...rest,
        prices: [],
        location: {
          type: GeoType.Point,
          coordinates: [longitude, latitude],
        },
      });
    }

    for await (const p of csvPrices) {
      const station = stationsById.get(p.idStation);
      if (station) {
        const { idStation, ...priceData } = p;
        station.prices.push(priceData);
      } else {
        console.log(`${p.idStation} not found in station`);
      }
    }

    return Array.from(stationsById.values());
  }
}
