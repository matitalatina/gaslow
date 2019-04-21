import { flatten } from "lodash";
import axios from "axios";
import ILatLng from "../models/ILatLng";
import IStep from "../models/IStep";

export class GoogleMapsClient {
  async getCoordsByRoute(from: ILatLng, to: ILatLng): Promise<IStep[]> {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&key=API_KEY`
    );
    const routes = response.data.routes;

    if (routes.length < 1) {
      return [];
    }

    return flatten(routes[0].legs
        .map((l: any) => l.steps)
      )
        .map((s: any) => ({
            from: {lat: s.start_location.lat, lng: s.start_location.lng},
            to: {lat: s.end_location.lat, lng: s.end_location.lng},
          })
        );
  }
}