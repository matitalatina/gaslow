import { injectable, inject } from "inversify";
import { GoogleMapsClient } from "../clients/GoogleMapsClient";
import { IStation } from "../models/Station";
import { StationConverter } from "../parsers/stationConverter";
import { TYPES } from "../di/types";
import ILatLng from "../models/ILatLng";
import GeoUtil from "../util/geo";
import type { IStationModelProvider } from "../models/StationModelProvider";
import { PriceDownloader } from "../fetchers/priceDownloader";
import { StationDownloader } from "../fetchers/stationDownloader";

@injectable()
export class StationService {
  constructor(
    @inject(TYPES.GoogleMapsClient) private googleMapsClient: GoogleMapsClient,
    @inject(TYPES.GeoUtil) private geoUtil: GeoUtil,
    @inject(TYPES.StationModelProvider)
    private stationModel: IStationModelProvider,
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
        this.stationModel.bulkUpsertById(
          this.stationConverter.merge(csvStations, csvPrices),
        );
      },
    );
  }

  findNearestByCoordinates(lat: number, lng: number): Promise<IStation[]> {
    console.log(lat, lng);
    return this.stationModel.findNearestByCoordinates(lat, lng);
  }

  async findOnTheRoute(from: ILatLng, to: ILatLng): Promise<IStation[]> {
    const polyline = await this.googleMapsClient.getPolylineByRoute(from, to);
    return this.stationModel.findWithinPolygon(
      this.geoUtil.fromPolylineToPolygon(polyline),
    );
  }

  findByIds(ids: number[]) {
    return this.stationModel.findByIds(ids);
  }
}
