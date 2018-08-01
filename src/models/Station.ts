import { Moment } from "moment";

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
  latitude: number,
  longitude: number,
  prices: Price[],
};