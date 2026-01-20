import { Container } from "inversify";
import { GoogleMapsClient } from "../clients/GoogleMapsClient.js";
import { StationsController } from "../controllers/stationController.js";
import { StationRepository } from "../repositories/StationRepository.js";
import type { IStationRepository } from "../repositories/StationRepository.js";
import { StationService } from "../services/stationService.js";
import GeoUtil from "../util/geo.js";
import { TYPES } from "./types.js";
import { PriceDownloader } from "../fetchers/priceDownloader.js";
import { StationDownloader } from "../fetchers/stationDownloader.js";
import { StringDownloader } from "../fetchers/stringDownloader.js";
import { PriceParser } from "../parsers/priceParser.js";
import { StationParser } from "../parsers/stationParser.js";
import { StationConverter } from "../parsers/stationConverter.js";
import { DbConnector } from "../repositories/DbConnector.js";
import { Collection, Db } from "mongodb";
import type { DbStation } from "../models/Station.js";
import { ValidationErrorFilter } from "../filters/ValidationErrorFilter.js";

const myContainer = new Container();
myContainer.bind(StationsController).toSelf();
myContainer.bind<StationService>(TYPES.StationService).to(StationService);
myContainer.bind<GoogleMapsClient>(TYPES.GoogleMapsClient).to(GoogleMapsClient);
myContainer.bind<GeoUtil>(TYPES.GeoUtil).to(GeoUtil);
myContainer
  .bind<IStationRepository>(TYPES.StationRepository)
  .to(StationRepository);

myContainer
  .bind<DbConnector>(TYPES.DbConnector)
  .to(DbConnector)
  .inSingletonScope();

myContainer.bind<Db>(TYPES.Db).toDynamicValue(() => {
  return myContainer.get<DbConnector>(TYPES.DbConnector).getDb();
});

myContainer
  .bind<Collection<DbStation>>(TYPES.StationCollection)
  .toDynamicValue(() => {
    return myContainer
      .get<DbConnector>(TYPES.DbConnector)
      .getCollection("stations");
  });
myContainer.bind<PriceDownloader>(TYPES.PriceDownloader).to(PriceDownloader);
myContainer
  .bind<StationDownloader>(TYPES.StationDownloader)
  .to(StationDownloader);
myContainer.bind<StringDownloader>(TYPES.StringDownloader).to(StringDownloader);
myContainer.bind<PriceParser>(TYPES.PriceParser).to(PriceParser);
myContainer.bind<StationParser>(TYPES.StationParser).to(StationParser);
myContainer.bind<StationConverter>(TYPES.StationConverter).to(StationConverter);

// Bind filter
myContainer.bind(ValidationErrorFilter).toSelf();

export { myContainer };
