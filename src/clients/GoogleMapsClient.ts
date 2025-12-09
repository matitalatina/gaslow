import axios from "axios";
import { injectable } from "inversify";
import type ILatLng from "../models/ILatLng.js";
import { GOOGLE_API_KEY } from "../util/secrets.js";

@injectable()
export class GoogleMapsClient {
  async getPolylineByRoute(from: ILatLng, to: ILatLng): Promise<string> {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&key=${GOOGLE_API_KEY}`,
    );
    const { routes } = response.data;

    if (routes.length < 1) {
      return undefined;
    }

    return routes[0].overview_polyline.points;
  }
}
