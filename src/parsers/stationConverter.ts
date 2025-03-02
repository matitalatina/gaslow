import { keyBy } from "lodash";
import { GeoType, IStation, Price } from "../models/Station";
import { CsvPrice } from "./models/csvPrice";
import { CsvStation } from "./models/csvStation";
import { injectable } from "inversify";

@injectable()
export class StationConverter {
  merge(csvStations: CsvStation[], csvPrices: CsvPrice[]): IStation[] {
    const stations: IStation[] = csvStations.map((s) => {
      const station = {
        prices: [] as Price[],
        location: {
          type: GeoType.Point,
          coordinates: [s.longitude, s.latitude],
        },
        ...s,
      };
      delete station.latitude;
      delete station.longitude;
      return station;
    });
    const stationsById = keyBy(stations, "id");
    csvPrices.forEach((p) => {
      const s = stationsById[p.idStation];
      if (s) {
        s.prices.push(p);
      } else {
        console.log(`${p.idStation} not found in station`);
      }
      delete p.idStation;
    });
    return stations;
  }
}
