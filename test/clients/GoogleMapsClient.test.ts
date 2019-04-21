import { GoogleMapsClient } from "./../../src/clients/GoogleMapsClient";
import { createSandbox } from "sinon";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { aGoogleMapsApiDirectionResponse } from "../utils/fixtures";

const sandbox = createSandbox();

const axiosMock = new MockAdapter(axios);

let client: GoogleMapsClient;

describe("GoogleMapsClient", () => {
  beforeEach(() => {
    client = new GoogleMapsClient();
  });

  afterEach(() => {
    axiosMock.reset();
    sandbox.restore();
  });

  it("should extract the route", async () => {
    axiosMock
      .onGet("https://maps.googleapis.com/maps/api/directions/json?origin=45.8725,9.73235&destination=45.464203,9.189982&key=API_KEY")
      .reply(200, aGoogleMapsApiDirectionResponse());

    const steps = await client.getCoordsByRoute({lat: 45.872500, lng: 9.732350}, {lat: 45.464203, lng: 9.189982});
    expect(steps.length).toBeGreaterThan(10);
    expect(steps[0].from).toEqual({ lat: 45.8725, lng: 9.732515899999999 });
    expect(steps[0].to).toEqual({ lat: 45.8718625, lng: 9.7307407 });
    expect(steps[steps.length - 1].from).toEqual({ lat: 45.4665738, lng: 9.1889772 });
    expect(steps[steps.length - 1].to).toEqual({ lat: 45.46495119999999, lng: 9.1892874 });
  });
});
