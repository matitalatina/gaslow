import type { Polygon } from "geojson";
import moment from "moment";
import type { BulkWriteResult } from "mongodb";
import { Document, model, Model, Schema } from "mongoose";

export enum GeoType {
  Point = "Point",
}
export type GeoJSON = {
  type: GeoType;
  coordinates: number[];
};

export enum FuelTypeEnum {
  GASOLINE = "GASOLINE",
  DIESEL = "DIESEL",
  OTHER = "OTHER",
}

export type Price = {
  fuelType: string;
  fuelTypeEnum?: FuelTypeEnum;
  price: number;
  isSelf: boolean;
  updatedAt: Date;
};

export type IStation = {
  id: number;
  manager: string;
  brand: string;
  type: string;
  name: string;
  address: string;
  city: string;
  province: string;
  location: GeoJSON;
  prices: Price[];
};

export type IStationDocument = Document & IStation;

export type IStationModel = Model<IStation> & {
  bulkUpsertById(stations: IStation[]): Promise<BulkWriteResult>;
  findNearestByCoordinates(
    lat: number,
    lng: number,
    limit?: number,
  ): Promise<IStation[]>;
  findWithinPolygon(geom: Polygon, limit?: number): Promise<IStation[]>;
  findByIds(ids: number[]): Promise<IStation[]>;
};

const priceSchema = new Schema(
  {
    fuelType: { type: String, required: true },
    price: { type: Number, required: true },
    isSelf: { type: Boolean, required: true },
    updatedAt: { type: Date, required: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

priceSchema.virtual("fuelTypeEnum").get(function () {
  if (!this.fuelType) {
    return FuelTypeEnum.OTHER;
  }
  const fuelTypeLower: string = this.fuelType.toLowerCase();
  if (fuelTypeLower.includes("enzin")) {
    return FuelTypeEnum.GASOLINE;
  }
  if (["asolio", "iesel", "uper"].some((s) => fuelTypeLower.includes(s))) {
    return FuelTypeEnum.DIESEL;
  }
  return FuelTypeEnum.OTHER;
});

function filterByPriceUpdatedAt(updatedAt: Date) {
  return { "prices.updatedAt": { $gte: updatedAt } };
}

const stationSchema = new Schema<IStation, IStationModel>(
  {
    id: {
      type: Number,
      required: true,
      index: true,
      unique: true,
    },
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
  },
  {
    timestamps: true,
    statics: {
      bulkUpsertById(stations: IStation[]) {
        const stationUpdates = stations
          .filter((s) => {
            const hasValidCoords =
              isFinite(s.location.coordinates[0]) &&
              isFinite(s.location.coordinates[1]);
            if (!hasValidCoords) {
              console.log(`Invalid coords: ${JSON.stringify(s)}`);
            }
            return hasValidCoords;
          })
          .map((station) => ({
            updateOne: {
              filter: { id: station.id },
              update: { $set: station },
              upsert: true,
            },
          }));
        return this.collection.bulkWrite(stationUpdates);
      },

      findNearestByCoordinates(
        lat: number,
        lng: number,
        limit: number = 100,
      ): Promise<IStation[]> {
        return this.find({
          location: {
            $near: { $geometry: { type: "Point", coordinates: [lng, lat] } },
          },
          ...filterByPriceUpdatedAt(moment().add(-1, "months").toDate()),
        })
          .limit(limit)
          .exec();
      },

      findWithinPolygon(
        geom: Polygon,
        limit: number = 300,
      ): Promise<IStation[]> {
        return this.find({
          location: { $geoWithin: { $geometry: geom } },
          ...filterByPriceUpdatedAt(moment().add(-1, "months").toDate()),
        })
          .limit(limit)
          .exec();
      },

      findByIds(ids: number[]): Promise<IStation[]> {
        return this.find({
          id: { $in: ids },
          ...filterByPriceUpdatedAt(moment().add(-1, "months").toDate()),
        }).exec();
      },
    },
  },
);

stationSchema.index({ location: "2dsphere" });

export const Station = model<IStation, IStationModel>("Station", stationSchema);
