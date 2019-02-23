import { StationService } from "../services/stationService";
import { Request, Response } from "express";

export function updateStationCollection(req: Request, res: Response): Promise<void> {
  return StationService.updateStationCollection().then(() => {
    res.json({ message: "Finished!" });
  });
}

export function findNearestByCoordinates(req: Request, res: Response): Promise<void> {
  return StationService.findNearestByCoordinates(req.query.lat, req.query.lng).then((stations) => {
    res.json({ items: stations });
  });
}