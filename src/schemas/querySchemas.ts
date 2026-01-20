import { z } from "zod";

// Helper functions for validation and parsing
const isValidIds = (s: string): boolean => {
  const nums = s.split(",").map((n) => parseInt(n.trim(), 10));
  return !nums.some(isNaN) && nums.every((n) => n > 0 && Number.isInteger(n));
};

const parseIds = (s: string): number[] => {
  return s.split(",").map((n) => parseInt(n.trim(), 10));
};

const isValidCoord = (str: string): boolean => {
  const parts = str.split(",");
  if (parts.length !== 2) return false;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
};

const parseCoord = (str: string) => {
  const parts = str.split(",");
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  return { lat, lng };
};

// Lenient schemas (ignore unknown params via .loose())
export const locationQuerySchema = z.looseObject({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type LocationQuerySchema = z.infer<typeof locationQuerySchema>;

// Individual param schemas
export const idsParamSchema = z
  .string()
  .refine(isValidIds, "Ids must be comma-separated positive integers")
  .transform(parseIds);

export const coordParamSchema = z
  .string()
  .refine(
    isValidCoord,
    "Must be valid 'lat,lng' with lat (-90 to 90) and lng (-180 to 180)",
  )
  .transform(parseCoord);

// For full object validation if needed (not used in pipes)
export const idsQuerySchema = z.looseObject({
  ids: idsParamSchema,
});

export type IdsQuerySchema = z.infer<typeof idsQuerySchema>;

export const routeQuerySchema = z.looseObject({
  from: coordParamSchema,
  to: coordParamSchema,
});

export type RouteQuerySchema = z.infer<typeof routeQuerySchema>;
