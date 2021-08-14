import { Container } from 'inversify';
import { GoogleMapsClient } from '../clients/GoogleMapsClient';
import { StationService } from '../services/stationService';
import GeoUtil from '../util/geo';
import { TYPES } from './types';

const myContainer = new Container();
myContainer.bind<StationService>(TYPES.StationService).to(StationService);
myContainer.bind<GoogleMapsClient>(TYPES.GoogleMapsClient).to(GoogleMapsClient);
myContainer.bind<GeoUtil>(TYPES.GeoUtil).to(GeoUtil);
export { myContainer };
