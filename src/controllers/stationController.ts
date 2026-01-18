import { type Request, type Response } from "express";
import {
  Controller,
  Get,
  Post,
  Request as RequestParam,
  Response as ResponseParam,
} from "@inversifyjs/http-core";
import { inject } from "inversify";
import { TYPES } from "../di/types.js";
import { StationService } from "../services/stationService.js";

@Controller("/stations")
export class StationsController {
  constructor(
    @inject(TYPES.StationService) private stationService: StationService,
  ) {}

  @Post("/update")
  updateStationCollection(
    @RequestParam() req: Request,
    @ResponseParam() res: Response,
  ): Promise<void> {
    return this.stationService.updateStationCollection().then(() => {
      res.json({ message: "Finished!" });
    });
  }

  @Get("/find/location")
  findNearestByCoordinates(
    @RequestParam() req: Request,
    @ResponseParam() res: Response,
  ): Promise<void> {
    return this.stationService
      .findNearestByCoordinates(+req.query.lat, +req.query.lng)
      .then((stations) => {
        res.json({ items: stations });
      });
  }

  @Get("/find")
  findByIds(
    @RequestParam() req: Request,
    @ResponseParam() res: Response,
  ): Promise<void> {
    const ids = (req.query.ids as string).split(",").map((i) => +i);
    return this.stationService.findByIds(ids).then((stations) => {
      res.json({ items: stations });
    });
  }

  @Get("/find/route")
  async findOnTheRoute(
    @RequestParam() req: Request,
    @ResponseParam() res: Response,
  ) {
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
