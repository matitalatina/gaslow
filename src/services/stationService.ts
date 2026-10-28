import { injectable, inject } from "inversify";
import type { Readable } from "node:stream";
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
import { UpdateMemoryLimitError } from "../errors.js";

const MAX_UPDATE_HEAP_BYTES = 350 * 1024 * 1024;

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
    const startedAt = Date.now();
    const controller = new AbortController();
    let stationStream: Readable | undefined;
    let priceStream: Readable | undefined;

    this.logMemory("update started");

    try {
      [stationStream, priceStream] = await Promise.all([
        this.stationDownloader.download(controller.signal),
        this.priceDownloader.download(controller.signal),
      ]);
      this.logMemory("download finished");
      this.assertHeapBelowGuard("download finished");

      const stations = await this.stationConverter.merge(
        this.stationParser.parseStream(stationStream),
        this.priceParser.parseStream(priceStream),
      );
      this.logMemory(`merge finished (${stations.length} stations)`);
      this.assertHeapBelowGuard("merge finished");

      await this.stationRepository.bulkUpsertById(stations);
      console.log(`[stations] update finished in ${Date.now() - startedAt}ms`);
    } catch (error) {
      controller.abort();
      console.error(
        `[stations] update failed after ${Date.now() - startedAt}ms`,
        error,
      );
      throw error;
    } finally {
      stationStream?.destroy();
      priceStream?.destroy();
    }
  }

  private assertHeapBelowGuard(stage: string): void {
    const { heapUsed } = process.memoryUsage();
    if (heapUsed > MAX_UPDATE_HEAP_BYTES) {
      throw new UpdateMemoryLimitError(
        `Heap usage ${Math.round(heapUsed / 1048576)}MB exceeded the ${Math.round(
          MAX_UPDATE_HEAP_BYTES / 1048576,
        )}MB guard at ${stage}`,
      );
    }
  }

  private logMemory(stage: string): void {
    const { heapUsed, rss } = process.memoryUsage();
    console.log(
      `[stations] ${stage} heap=${Math.round(heapUsed / 1048576)}MB rss=${Math.round(
        rss / 1048576,
      )}MB`,
    );
  }

  findNearestByCoordinates(lat: number, lng: number): Promise<Station[]> {
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
