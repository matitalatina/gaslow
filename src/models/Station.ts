import { IStation } from "./Station";
import mongoose, { Model } from "mongoose";
import { BulkWriteOpResultObject } from "mongodb";
import { isNumber } from "lodash";

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
  updatedAt: Date,
};

export type IStationRaw = {
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
export type IStation = mongoose.Document & IStationRaw;

export type IStationModel = Model<IStation> & {
  bulkUpsertById: (stations: IStationRaw[]) => Promise<BulkWriteOpResultObject>,
};

const stationSchema = new mongoose.Schema({
  id: { type: Number, required: true, index: true, unique: true },
  manager: String,
  brand: String,
  type: String,
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: [Number],
  },
  prices: [{
    fuelType: { type: String, required: true },
    price: { type: Number, required: true },
    isSelf: { type: Boolean, required: true },
    updatedAt: { type: Date, required: true },
  }],
}, { timestamps: true });

stationSchema.index({ "location": "2dsphere" });

stationSchema.statics.bulkUpsertById = function (stations: IStation[]) {
  const stationUpdates = stations
    .filter(s => {
      const hasValidCoords = isNumber(s.location.coordinates[0]) && isNumber(s.location.coordinates[1]);
      if (!hasValidCoords) {
        console.log("Invalid coords: " + s);
      }
      return hasValidCoords;
    })
    .map(station => ({
      updateOne: {
        filter: { id: station.id },
        update: station,
        upsert: true,
      }
    }));
  return (this as Model<IStation>).collection.bulkWrite(stationUpdates);
};
export const Station: IStationModel = (() => {
  try {
    return mongoose.model<IStation, IStationModel>("Station");
  } catch (e) {
    return mongoose.model<IStation, IStationModel>("Station", stationSchema);
  }
})();