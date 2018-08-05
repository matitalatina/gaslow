import { StationService } from "../services/stationService";
import { Request, Response } from "express";
export function updateStationCollection(req: Request, res: Response) {
  StationService.updateStationCollection();
  res.json({ message: "Started!" });
}

export function findNearestByCoordinates(req: Request, res: Response): Promise<void> {
  return StationService.findNearestByCoordinates(req.query.lat, req.query.lng).then((stations) => {
    res.json({ items: stations });
  });
}