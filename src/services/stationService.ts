import { GoogleMapsClient } from "./../clients/GoogleMapsClient";
import { IStationDocument } from "../models/Station";
import { Station } from "../models/Station";
import { StationConverter } from "../parsers/stationConverter";
import { PriceParser } from "../parsers/priceParser";
import { StringDownloader } from "../fetchers/stringDownloader";
import StationParser from "../parsers/stationParser";
import { injectable, inject } from "inversify";
import { TYPES } from "../di/types";
import ILatLng from "../models/ILatLng";
import GeoUtil from "../util/geo";
@injectable()
export class StationService {
  constructor(
    @inject(TYPES.GoogleMapsClient) private googleMapsClient: GoogleMapsClient,
    @inject(TYPES.GeoUtil) private geoUtil: GeoUtil,
  ) {

  }
  static pricesSource: string = "https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv";
  static stationsSource: string = "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";

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
      });
  }

  static findNearestByCoordinates(lat: number, lng: number): Promise<IStationDocument[]> {
    console.log(lat, lng)
    return Station.findNearestByCoordinates(lat, lng);
  }

  async findOnTheRoute(from: ILatLng, to: ILatLng): Promise<IStationDocument[]> {
    const polyline = await this.googleMapsClient.getPolylineByRoute(from, to);
    return Station.findWithinPolygon(this.geoUtil.fromPolylineToPolygon(polyline));
  }
}