import { GeoType, IStation, IStationRaw } from "../models/Station";
import { CsvStation } from "./models/csvStation";
import { CsvPrice } from "./models/csvPrice";
import { keyBy } from "lodash";
export class StationConverter {
  static merge(csvStations: CsvStation[], csvPrices: CsvPrice[]): IStationRaw[] {
    const stations: IStationRaw[] = csvStations.map(s => {
      const station = Object.assign({
        prices: [],
        location: {
          type: GeoType.Point,
          coordinates: [s.longitude, s.latitude],
        },
      }, s);
      delete station.latitude;
      delete station.longitude;
      return station;
    });
    const stationsById = keyBy(stations, "id");
    csvPrices.forEach(p => {
      const s = stationsById[p.idStation];
      if (s) {
        s.prices.push(p);
      }
      else {
        console.log(p.idStation + " not found in station");
      }
      delete p["idStation"];
    });
    return stations;
  }
}