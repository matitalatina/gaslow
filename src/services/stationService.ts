import { injectable, inject } from "inversify";
import { StationRepository } from "../repositories/StationRepository.js";
import type { IStationRepository } from "../repositories/StationRepository.js";
import type { Station } from "../models/Station.js";
import { GoogleMapsClient } from "../clients/GoogleMapsClient.js";
import { StationConverter } from "../parsers/stationConverter.js";
import { TYPES } from "../di/types.js";
import type ILatLng from "../models/ILatLng.js";
import GeoUtil from "../util/geo.js";
import { PriceDownloader } from "../fetchers/priceDownloader.js";
import { StationDownloader } from "../fetchers/stationDownloader.js";

@injectable()
export class StationService {
  constructor(
    @inject(TYPES.GoogleMapsClient) private googleMapsClient: GoogleMapsClient,
    @inject(TYPES.GeoUtil) private geoUtil: GeoUtil,
    @inject(TYPES.StationRepository)
    private stationRepository: IStationRepository,
    @inject(TYPES.PriceDownloader) private priceDownloader: PriceDownloader,
    @inject(TYPES.StationDownloader)
    private stationDownloader: StationDownloader,
    @inject(TYPES.StationConverter)
    private stationConverter: StationConverter,
  ) {}

  static stationsSource: string =
    "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";

  updateStationCollection(): Promise<void> {
    const csvStationsPromise = this.stationDownloader.download();
    const csvPricesPromise = this.priceDownloader.download();

    return Promise.all([csvStationsPromise, csvPricesPromise]).then(
      ([csvStations, csvPrices]) => {
        this.stationRepository.bulkUpsertById(
          this.stationConverter.merge(csvStations, csvPrices),
        );
      },
    );
  }

  findNearestByCoordinates(lat: number, lng: number): Promise<Station[]> {
    console.log(lat, lng);
    return this.stationRepository.findNearestByCoordinates(lat, lng);
  }

  async findOnTheRoute(from: ILatLng, to: ILatLng): Promise<Station[]> {
    const polyline = await this.googleMapsClient.getPolylineByRoute(from, to);
    return this.stationRepository.findWithinPolygon(
      this.geoUtil.fromPolylineToPolygon(polyline),
    );
  }

  findByIds(ids: number[]) {
    return this.stationRepository.findByIds(ids);
  }
}
