import { Moment } from "moment";

export enum GeoType {
  Point = "Point",
}
export type GeoJSON = {
  type: GeoType,
  coordinates: number[],
};

export type Price = {
  fuelType: String,
  price: number,
  isSelf: boolean,
  updatedAt: Moment,
};
export type Station = {
  id: number,
  manager: string,
  brand: string,
  type: string,
  name: string,
  address: string,
  city: string,
  province: string,
  location: GeoJSON,
  prices: Price[],
};