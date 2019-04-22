import { StationService } from "../services/stationService";
import { Request, Response } from "express";
import { interfaces, controller, httpGet, httpPost, request, response } from "inversify-express-utils";

@controller("/stations")
export class StationsController implements interfaces.Controller {
  @httpPost("/update")
  updateStationCollection(@request() req: Request, @response() res: Response): Promise<void> {
    return StationService.updateStationCollection().then(() => {
      res.json({ message: "Finished!" });
    });
  }

  @httpGet("/find/location")
  findNearestByCoordinates(@request() req: Request, @response() res: Response): Promise<void> {
    return StationService.findNearestByCoordinates(req.query.lat, req.query.lng).then((stations) => {
      res.json({ items: stations });
    });
  }
}
