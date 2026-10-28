import { injectable, inject } from "inversify";
import type { IStationRepository } from "../repositories/StationRepository.js";
import type { Station } from "../models/Station.js";
import { GoogleMapsClient } from "../clients/GoogleMapsClient.js";
import { StationConverter } from "../parsers/stationConverter.js";
import { TYPES } from "../di/types.js";
import type ILatLng from "../models/ILatLng.js";
import GeoUtil from "../util/geo.js";
import { PriceDownloader } from "../fetchers/priceDownloader.js";
import { StationDownloader } from "../fetchers/stationDownloader.js";
import { StationParser } from "../parsers/stationParser.js";
import { PriceParser } from "../parsers/priceParser.js";

@injectable()
export class StationService {
  private updateInFlight: Promise<void> | null = null;

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
    @inject(TYPES.StationParser) private stationParser: StationParser,
    @inject(TYPES.PriceParser) private priceParser: PriceParser,
  ) {}

  static stationsSource: string =
    "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";

  updateStationCollection(): Promise<void> {
    if (this.updateInFlight) {
      return this.updateInFlight;
    }

    this.updateInFlight = this.performUpdate().finally(() => {
      this.updateInFlight = null;
    });

    return this.updateInFlight;
  }

  private async performUpdate(): Promise<void> {
    const [csvStations, csvPrices] = await Promise.all([
      this.stationDownloader.download(),
      this.priceDownloader.download(),
    ]);

    const stations = await this.stationConverter.merge(
      this.stationParser.parseStream(csvStations),
      this.priceParser.parseStream(csvPrices),
    );

    await this.stationRepository.bulkUpsertById(stations);
  }

  findNearestByCoordinates(lat: number, lng: number): Promise<Station[]> {
    console.log(lat, lng);
    return this.stationRepository.findNearestByCoordinates(lat, lng);
  }

  async findOnTheRoute(from: ILatLng, to: ILatLng): Promise<Station[]> {
    const polyline = await this.googleMapsClient.getPolylineByRoute(from, to);
    if (!polyline) {
      return [];
    }
    return this.stationRepository.findWithinPolygon(
      this.geoUtil.fromPolylineToPolygon(polyline),
    );
  }

  findByIds(ids: number[]) {
    return this.stationRepository.findByIds(ids);
  }
}
