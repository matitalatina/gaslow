import IStep from "../models/IStep";
import IPolygon from "../models/IPolygon";
import { lineString, Polygon, Feature } from "@turf/helpers";
import buffer from "@turf/buffer";
import polyline = require("@mapbox/polyline");

export default class GeoUtil {
  static fromStepsToPolygon(steps: IStep[]): Feature<Polygon> {
    const line = lineString(steps.map(s => [s.from.lng, s.from.lat]), {name: "line"});
    const polygon =  buffer(line, 1, {units: "kilometers"});
    return polygon;
  }
  static fromPolylineToPolygon(lineStr: string): Feature<Polygon> {
    const latLngs = polyline.decode(lineStr, 5);
    const line = lineString(latLngs.map(([lat, lng]: number[]) => [lng, lat]), {name: "line"});
    const polygon =  buffer(line, 1, {units: "kilometers"});
    return polygon;
  }
}