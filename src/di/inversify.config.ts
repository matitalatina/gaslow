import { Container } from "inversify";
import { GoogleMapsClient } from "../clients/GoogleMapsClient";
import {
  IStationModelProvider,
  StationModelProvider,
} from "../models/StationModelProvider";
import { StationService } from "../services/stationService";
import GeoUtil from "../util/geo";
import { TYPES } from "./types";
import { PriceDownloader } from "../fetchers/priceDownloader";
import { StationDownloader } from "../fetchers/stationDownloader";
const myContainer = new Container();
myContainer.bind<StationService>(TYPES.StationService).to(StationService);
myContainer.bind<GoogleMapsClient>(TYPES.GoogleMapsClient).to(GoogleMapsClient);
myContainer.bind<GeoUtil>(TYPES.GeoUtil).to(GeoUtil);
myContainer
  .bind<IStationModelProvider>(TYPES.StationModelProvider)
  .to(StationModelProvider);
myContainer.bind<PriceDownloader>(TYPES.PriceDownloader).to(PriceDownloader);
myContainer
  .bind<StationDownloader>(TYPES.StationDownloader)
  .to(StationDownloader);
export { myContainer };
