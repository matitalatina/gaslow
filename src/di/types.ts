const TYPES = {
  StationService: Symbol.for("StationService"),
  GoogleMapsClient: Symbol.for("GoogleMapsClient"),
  GeoUtil: Symbol.for("GeoUtil"),
  StationRepository: Symbol.for("StationRepository"),
  StationCollection: Symbol.for("StationCollection"),
  Db: Symbol.for("Db"),
  PriceDownloader: Symbol.for("PriceDownloader"),
  StationDownloader: Symbol.for("StationDownloader"),
  StringDownloader: Symbol.for("StringDownloader"),
  PriceParser: Symbol.for("PriceParser"),
  StationParser: Symbol.for("StationParser"),
  StationConverter: Symbol.for("StationConverter"),
  DbConnector: Symbol.for("DbConnector"),
};

export { TYPES };
