import { z } from "zod";

export enum GeoType {
  Point = "Point",
}

export const GeoJSONSchema = z.object({
  type: z.enum(GeoType),
  coordinates: z.array(z.number()),
});

export type GeoJSON = z.infer<typeof GeoJSONSchema>;

export enum FuelTypeEnum {
  GASOLINE = "GASOLINE",
  DIESEL = "DIESEL",
  OTHER = "OTHER",
}

export const DbPriceSchema = z.object({
  fuelType: z.string(),
  price: z.number(),
  isSelf: z.boolean(),
  updatedAt: z.coerce.date(),
});

export type DbPrice = z.infer<typeof DbPriceSchema>;

export const PriceSchema = DbPriceSchema.extend({
  fuelTypeEnum: z.enum(FuelTypeEnum).optional(),
});

export type Price = z.infer<typeof PriceSchema>;

export const DbStationSchema = z.object({
  id: z.number(),
  manager: z.string().optional(),
  brand: z.string().optional(),
  type: z.string().optional(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  location: GeoJSONSchema,
  prices: z.array(DbPriceSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type DbStation = z.infer<typeof DbStationSchema>;

export const StationSchema = DbStationSchema.extend({
  prices: z.array(PriceSchema),
});

export type Station = z.infer<typeof StationSchema>;

// Mapper function for computed properties
export function toStation(dbStation: DbStation): Station {
  return {
    ...dbStation,
    prices: dbStation.prices.map((p) => ({
      ...p,
      fuelTypeEnum: getFuelTypeEnum(p.fuelType),
    })),
  };
}

function getFuelTypeEnum(fuelType: string): FuelTypeEnum {
  if (!fuelType) {
    return FuelTypeEnum.OTHER;
  }
  const fuelTypeLower = fuelType.toLowerCase();
  if (fuelTypeLower.includes("enzin")) {
    return FuelTypeEnum.GASOLINE;
  }
  if (["asolio", "iesel", "uper"].some((s) => fuelTypeLower.includes(s))) {
    return FuelTypeEnum.DIESEL;
  }
  return FuelTypeEnum.OTHER;
}
