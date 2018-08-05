import { Station } from "../models/Station";
import { StationConverter } from "../parsers/stationConverter";
import { PriceParser } from "../parsers/priceParser";
import { StringDownloader } from "../fetchers/stringDownloader";
import StationParser from "../parsers/stationParser";
export class StationService {
  static pricesSource: string = "http://www.sviluppoeconomico.gov.it/images/exportCSV/prezzo_alle_8.csv";
  static stationsSource: string = "http://www.sviluppoeconomico.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";

  static updateStationCollection(): Promise<void> {
    const csvStationsPromise = StringDownloader
      .download(this.stationsSource)
      .then(StationParser.parse);
    const csvPricesPromise = StringDownloader
      .download(this.pricesSource)
      .then(PriceParser.parse);

    return Promise
      .all([csvStationsPromise, csvPricesPromise])
      .then(([csvStations, csvPrices]) => {
        Station.bulkUpsertById(StationConverter.merge(csvStations, csvPrices));
        return undefined;
      });
  }
}