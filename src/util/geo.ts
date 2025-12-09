import { buffer } from "@turf/buffer";
import { lineString } from "@turf/helpers";
import { injectable } from "inversify";
import polyline from "@mapbox/polyline";
import type { Polygon } from "geojson";

@injectable()
export default class GeoUtil {
  fromPolylineToPolygon(lineStr: string): Polygon {
    const latLngs = polyline.decode(lineStr, 5);
    const line = lineString(
      latLngs.map(([lat, lng]: number[]) => [lng, lat]),
      { name: "line" },
    );
    const buffered = buffer(line, 1, { units: "kilometers", steps: 8 });

    if (!buffered) {
      throw new Error("Failed to create buffer from polyline");
    }

    return buffered.geometry as Polygon;
  }
}
