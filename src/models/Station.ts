import { IStationDocument } from "./Station";
import mongoose, { Model } from "mongoose";
import { BulkWriteOpResultObject } from "mongodb";
import { isNumber } from "lodash";
import { Polygon } from "@turf/helpers";

export enum GeoType {
  Point = "Point",
}
export type GeoJSON = {
  type: GeoType,
  coordinates: number[],
};

export enum FuelTypeEnum {
  GASOLINE = "GASOLINE",
  DIESEL = "DIESEL",
  OTHER = "OTHER",
}

export type Price = {
  fuelType: String,
  fuelTypeEnum?: FuelTypeEnum,
  price: number,
  isSelf: boolean,
  updatedAt: Date,
};

export type IStation = {
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
export type IStationDocument = mongoose.Document & IStation;

export type IStationModel = Model<IStationDocument> & {
  bulkUpsertById: (stations: IStation[]) => Promise<BulkWriteOpResultObject>,
  findNearestByCoordinates: (lat: number, lng: number, limit?: number) => Promise<IStationDocument[]>,
  findWithinPolygon: (geom: Polygon, limit?: number) => Promise<IStationDocument[]>,
};

const priceSchema = new mongoose.Schema({
  fuelType: { type: String, required: true },
  price: { type: Number, required: true },
  isSelf: { type: Boolean, required: true },
  updatedAt: { type: Date, required: true },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

priceSchema.virtual("fuelTypeEnum").get(function() {
  if (!this.fuelType) {
    return FuelTypeEnum.OTHER;
  }
  const fuelTypeLower: String = this.fuelType.toLowerCase();
  if (fuelTypeLower.includes("enzin")) {
    return FuelTypeEnum.GASOLINE;
  }
  else if (["asolio", "iesel", "uper"].some((s) => fuelTypeLower.includes(s))) {
    return FuelTypeEnum.DIESEL;
  }
  return FuelTypeEnum.OTHER;
});

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
  prices: [priceSchema],
}, { timestamps: true });

stationSchema.index({ "location": "2dsphere" });

stationSchema.statics.bulkUpsertById = function (stations: IStationDocument[]) {
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
  return (this as IStationModel).collection.bulkWrite(stationUpdates);
};

stationSchema.statics.findNearestByCoordinates = function (lat: number, lng: number, limit: number = 50): Promise<IStationDocument[]> {
  return (this as IStationModel)
    .find({ "location": { $near: { $geometry: { type: "Point", coordinates: [lng, lat] } } } })
    .limit(limit)
    .exec();
};

stationSchema.statics.findWithinPolygon = function (geom: Polygon, limit: number = 300): Promise<IStationDocument[]> {
  return (this as IStationModel)
    .find({ "location": { $geoWithin: { $geometry: geom } } })
    .limit(limit)
    .exec();
};
export const Station: IStationModel = (() => {
  try {
    return mongoose.model<IStationDocument, IStationModel>("Station");
  } catch (e) {
    return mongoose.model<IStationDocument, IStationModel>("Station", stationSchema);
  }
})();