import fs from "fs";
import moment from "moment";
import { type Station, type Price, GeoType } from "../../src/models/Station.js";
import type { CsvPrice } from "../../src/parsers/models/csvPrice.js";
import type { CsvStation } from "../../src/parsers/models/csvStation.js";

export function aPrice(): Price {
  return {
    fuelType: "Benzina",
    price: 1.45,
    isSelf: true,
    updatedAt: new Date(),
    fuelTypeEnum: undefined, // Or populate it if needed for specific tests
  };
}
export function aStation(i: number = 1): Station {
  return {
    id: i,
    manager: `manager${i}`,
    brand: `brand${i}`,
    type: `type${i}`,
    name: `name${i}`,
    address: `address${i}`,
    city: `city${i}`,
    province: `province${i}`,
    location: {
      type: GeoType.Point,
      coordinates: [i * 2.0, i * 1.0],
    },
    prices: [aPrice()],
  };
}

export function aCsvStation(i: number = 1): CsvStation {
  return {
    id: i,
    manager: `manager${i}`,
    brand: `brand${i}`,
    type: `type${i}`,
    name: `name${i}`,
    address: `address${i}`,
    city: `city${i}`,
    province: `province${i}`,
    latitude: 1.0,
    longitude: 2.0,
  };
}

export function aCsvPrice(i: number = 1): CsvPrice {
  return {
    idStation: i,
    fuelType: `fuelType${i}`,
    price: i,
    isSelf: true,
    updatedAt: moment(123).toDate(),
  };
}
export function aGoogleMapsApiDirectionResponse(): string {
  return fs.readFileSync(
    `${__dirname}/../assets/googleMapsApiDirectionResponse.json`,
    "utf-8",
  );
}
