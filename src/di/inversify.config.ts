import { Container } from "inversify";
import { GoogleMapsClient } from "../clients/GoogleMapsClient.js";
import type { IStationModelProvider } from "../models/StationModelProvider.js";
import { StationModelProvider } from "../models/StationModelProvider.js";
import { StationService } from "../services/stationService.js";
import GeoUtil from "../util/geo.js";
import { TYPES } from "./types.js";
import { PriceDownloader } from "../fetchers/priceDownloader.js";
import { StationDownloader } from "../fetchers/stationDownloader.js";
import { StringDownloader } from "../fetchers/stringDownloader.js";
import { PriceParser } from "../parsers/priceParser.js";
import { StationParser } from "../parsers/stationParser.js";
import { StationConverter } from "../parsers/stationConverter.js";

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
myContainer.bind<StringDownloader>(TYPES.StringDownloader).to(StringDownloader);
myContainer.bind<PriceParser>(TYPES.PriceParser).to(PriceParser);
myContainer.bind<StationParser>(TYPES.StationParser).to(StationParser);
myContainer.bind<StationConverter>(TYPES.StationConverter).to(StationConverter);
export { myContainer };
