import { StationService } from "../services/stationService";
import { Request, Response } from "express";
export function updateStationCollection(req: Request, res: Response) {
  StationService.updateStationCollection();
  res.json({ message: "Started!" });
}