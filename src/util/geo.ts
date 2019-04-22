import buffer from "@turf/buffer";
import { Feature, lineString, Polygon } from "@turf/helpers";
import { injectable } from "inversify";
import polyline = require("@mapbox/polyline");

@injectable()
export default class GeoUtil {
  fromPolylineToPolygon(lineStr: string): Polygon {
    const latLngs = polyline.decode(lineStr, 5);
    const line = lineString(latLngs.map(([lat, lng]: number[]) => [lng, lat]), {name: "line"});
    const polygon =  buffer(line, 1, {units: "kilometers"});
    return polygon.geometry;
  }
}