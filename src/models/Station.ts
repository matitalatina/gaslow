import { Moment } from "moment";
import mongoose from "mongoose";

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
export type StationModel = mongoose.Document & {
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

const stationSchema = new mongoose.Schema({
  id: Number,
  manager: String,
  brand: String,
  type: String,
  name: String,
  address: String,
  city: String,
  province: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: [Number],
  },
  prices: [{
    fuelType: String,
    price: Number,
    isSelf: Boolean,
    updatedAt: Date,
  }],
}, { timestamps: true });
export const Station = mongoose.model<StationModel>("Station", stationSchema);