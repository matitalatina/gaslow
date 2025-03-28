import { type Request, type Response } from "express";
import {
  controller,
  httpGet,
  httpPost,
  request,
  response,
} from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../di/types";
import { StationService } from "../services/stationService";

@controller("/stations")
export class StationsController {
  constructor(
    @inject(TYPES.StationService) private stationService: StationService,
  ) {}

  @httpPost("/update")
  updateStationCollection(
    @request() req: Request,
    @response() res: Response,
  ): Promise<void> {
    return this.stationService.updateStationCollection().then(() => {
      res.json({ message: "Finished!" });
    });
  }

  @httpGet("/find/location")
  findNearestByCoordinates(
    @request() req: Request,
    @response() res: Response,
  ): Promise<void> {
    return this.stationService
      .findNearestByCoordinates(+req.query.lat, +req.query.lng)
      .then((stations) => {
        res.json({ items: stations });
      });
  }

  @httpGet("/find")
  findByIds(@request() req: Request, @response() res: Response): Promise<void> {
    const ids = (req.query.ids as string).split(",").map((i) => +i);
    return this.stationService.findByIds(ids).then((stations) => {
      res.json({ items: stations });
    });
  }

  @httpGet("/find/route")
  async findOnTheRoute(@request() req: Request, @response() res: Response) {
    const [fromLat, fromLng] = (req.query.from as string)
      .split(",")
      .map((n: string) => parseFloat(n));
    const [toLat, toLng] = (req.query.to as string)
      .split(",")
      .map((n: string) => parseFloat(n));
    const stations = await this.stationService.findOnTheRoute(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
    );
    res.json({ items: stations });
  }
}
