import { injectable } from "inversify";
import { Polygon } from "@turf/helpers";
import { BulkWriteResult, DeleteResult } from "mongodb";
import { IStation, Station } from "./Station";

export interface IStationModelProvider {
  bulkUpsertById(stations: IStation[]): Promise<BulkWriteResult>;
  findNearestByCoordinates(
    lat: number,
    lng: number,
    limit?: number,
  ): Promise<IStation[]>;
  findWithinPolygon(geom: Polygon, limit?: number): Promise<IStation[]>;
  findByIds(ids: number[]): Promise<IStation[]>;
  deleteMany(filter: object): { exec: () => Promise<DeleteResult> };
  findOne(filter: object): { exec: () => Promise<IStation | null> };
  find(filter: object): {
    limit: (n: number) => { exec: () => Promise<IStation[]> };
    exec: () => Promise<IStation[]>;
  };
}

@injectable()
export class StationModelProvider implements IStationModelProvider {
  bulkUpsertById(stations: IStation[]): Promise<BulkWriteResult> {
    return Station.bulkUpsertById(stations);
  }

  findNearestByCoordinates(
    lat: number,
    lng: number,
    limit?: number,
  ): Promise<IStation[]> {
    return Station.findNearestByCoordinates(lat, lng, limit);
  }

  findWithinPolygon(geom: Polygon, limit?: number): Promise<IStation[]> {
    return Station.findWithinPolygon(geom, limit);
  }

  findByIds(ids: number[]): Promise<IStation[]> {
    return Station.findByIds(ids);
  }

  deleteMany(filter: object) {
    return Station.deleteMany(filter);
  }

  findOne(filter: object) {
    return Station.findOne(filter);
  }

  find(filter: object) {
    return Station.find(filter);
  }
}
