import { flatten } from "lodash";
import axios from "axios";
import ILatLng from "../models/ILatLng";
import IStep from "../models/IStep";
import { Router } from "express";

export class GoogleMapsClient {
  async getPolygonByRoute(from: ILatLng, to: ILatLng): Promise<string> {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&key=API_KEY`
    );
    const routes = response.data.routes;

    if (routes.length < 1) {
      return undefined;
    }

    return routes[0].overview_polyline.points;
  }
}