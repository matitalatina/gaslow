import { Station } from "../models/Station";
import { CsvStation } from "./models/csvStation";
import { CsvPrice } from "./models/csvPrice";
import { keyBy } from "lodash";
export class StationConverter {
  merge(csvStations: CsvStation[], csvPrices: CsvPrice[]): Station[] {
    const stations: Station[] = csvStations.map(s => Object.assign({ prices: [] }, s));
    const stationsById = keyBy(stations, "id");
    csvPrices.forEach(p => {
      stationsById[p.idStation].prices.push(p);
      delete p["idStation"];
    });
    return stations;
  }
}