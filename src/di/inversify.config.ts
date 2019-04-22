import { Container } from "inversify";
import { TYPES } from "./types";
import { StationService } from "../services/stationService";
import "reflect-metadata";

const myContainer = new Container();
myContainer.bind<StationService>(TYPES.StationService).to(StationService);
export { myContainer };