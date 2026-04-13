import { keyBy } from "lodash-es";
import { GeoType } from "../models/Station.js";
import type { Station } from "../models/Station.js";
import type { CsvPrice } from "./models/csvPrice.js";
import type { CsvStation } from "./models/csvStation.js";
import { injectable } from "inversify";

@injectable()
export class StationConverter {
  merge(csvStations: CsvStation[], csvPrices: CsvPrice[]): Station[] {
    const stations: Station[] = [];

    for (const s of csvStations) {
      const { latitude, longitude, ...rest } = s;
      if (!latitude || !longitude) {
        continue;
      }

      stations.push({
        ...rest,
        prices: [],
        location: {
          type: GeoType.Point,
          coordinates: [longitude, latitude],
        },
      });
    }

    const stationsById = keyBy(stations, "id");
    csvPrices.forEach((p) => {
      const s = stationsById[p.idStation];
      if (s) {
        const { idStation, ...priceData } = p;
        s.prices.push(priceData);
      } else {
        console.log(`${p.idStation} not found in station`);
      }
    });
    return stations;
  }
}
