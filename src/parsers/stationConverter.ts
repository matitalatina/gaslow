import { GeoType, StationModel, Station } from "./../models/Station";
import { CsvStation } from "./models/csvStation";
import { CsvPrice } from "./models/csvPrice";
import { keyBy } from "lodash";
export class StationConverter {
  merge(csvStations: CsvStation[], csvPrices: CsvPrice[]): StationModel[] {
    const stations: StationModel[] = csvStations.map(s => {
      const station = Object.assign({
        prices: [],
        location: {
          type: GeoType.Point,
          coordinates: [s.longitude, s.latitude],
        },
      }, s);
      delete station.latitude;
      delete station.longitude;
      return new Station(station);
    });
    const stationsById = keyBy(stations, "id");
    csvPrices.forEach(p => {
      stationsById[p.idStation].prices.push(p);
      delete p["idStation"];
    });
    return stations;
  }
}