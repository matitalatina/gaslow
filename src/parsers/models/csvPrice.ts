import { Moment } from "../../../node_modules/moment";

export type CsvPrice = {
  idStation: number,
  fuelType: String,
  price: number,
  isSelf: boolean,
  updatedAt: Moment,
};