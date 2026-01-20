import { type Request, type Response } from "express";
import {
  Controller,
  Get,
  Post,
  Query,
  Request as RequestParam,
  Response as ResponseParam,
} from "@inversifyjs/http-core";
import { inject } from "inversify";
import { TYPES } from "../di/types.js";
import { StationService } from "../services/stationService.js";
import { ZodValidationPipe } from "../pipes/ZodValidationPipe.js";
import {
  locationQuerySchema,
  idsQuerySchema,
  routeQuerySchema,
  type LocationQuerySchema,
  type RouteQuerySchema,
  type IdsQuerySchema,
} from "../schemas/querySchemas.js";

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
    @Query(new ZodValidationPipe(locationQuerySchema))
    latLng: LocationQuerySchema,
    @ResponseParam() res: Response,
  ): Promise<void> {
    return this.stationService
      .findNearestByCoordinates(latLng.lat, latLng.lng)
      .then((stations) => {
        res.json({ items: stations });
      });
  }

  @Get("/find")
  findByIds(
    @Query(new ZodValidationPipe(idsQuerySchema)) query: IdsQuerySchema,
    @ResponseParam() res: Response,
  ): Promise<void> {
    return this.stationService.findByIds(query.ids).then((stations) => {
      res.json({ items: stations });
    });
  }

  @Get("/find/route")
  async findOnTheRoute(
    @Query(new ZodValidationPipe(routeQuerySchema))
    query: RouteQuerySchema,
    @ResponseParam() res: Response,
  ) {
    const stations = await this.stationService.findOnTheRoute(
      query.from,
      query.to,
    );
    res.json({ items: stations });
  }
}
