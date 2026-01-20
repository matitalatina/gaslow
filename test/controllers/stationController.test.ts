/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  mock,
  instance,
  reset,
  when,
  deepEqual,
  verify,
  anyNumber,
} from "ts-mockito";
import { StationService } from "../../src/services/stationService.js";
import { StationsController } from "../../src/controllers/stationController.js";
import { aStation } from "../utils/fixtures.js";
import { range } from "lodash-es";
import { describe, it, expect, afterEach, vi } from "vitest";
import { ZodValidationPipe } from "../../src/pipes/ZodValidationPipe.js";
import { ValidationErrorFilter } from "../../src/filters/ValidationErrorFilter.js";
import { locationQuerySchema } from "../../src/schemas/querySchemas.js";
import { ZodError } from "zod";

const mockStationService = mock(StationService);

const controller = new StationsController(instance(mockStationService));

describe("StationController", () => {
  afterEach(() => {
    reset(mockStationService);
  });

  it("should update stations", () => {
    when(mockStationService.updateStationCollection()).thenResolve(undefined);
    const req: any = {};
    const json = vi.fn();
    const res: any = {
      json,
    };
    return controller.updateStationCollection(req, res).then(() => {
      expect(json.mock.calls.length).toBe(1);
      verify(mockStationService.updateStationCollection()).called();
    });
  });

  it("should findNearestByCoordinates", () => {
    when(
      mockStationService.findNearestByCoordinates(anyNumber(), anyNumber()),
    ).thenResolve([aStation()]);
    const json = vi.fn();
    const res: any = {
      json,
    };
    return controller.findNearestByCoordinates(1.0, 2.0, res).then(() => {
      expect(json.mock.calls.length).toBe(1);
      expect((json.mock.calls[0][0] as any).items[0].id).toBe(aStation().id);
    });
  });

  it("should findNearestByRoute", () => {
    const from = { lat: 1, lng: 2 };
    const to = { lat: -3.3, lng: 4.4 };
    when(
      mockStationService.findOnTheRoute(deepEqual(from), deepEqual(to)),
    ).thenResolve([aStation()]);
    const json = vi.fn();
    const res: any = {
      json,
    };
    return controller.findOnTheRoute(from, to, res).then(() => {
      expect(json.mock.calls.length).toBe(1);
      expect((json.mock.calls[0][0] as any).items[0].id).toEqual(aStation().id);
    });
  });

  it("should findByIds", async () => {
    const stations = range(2).map(aStation);
    when(mockStationService.findByIds(deepEqual([1, 2]))).thenResolve(stations);
    const json = vi.fn();
    const res: any = {
      json,
    };

    await controller.findByIds([1, 2], res);

    expect(json.mock.calls.length).toBe(1);
    expect((json.mock.calls[0][0] as any).items[0].id).toBe(stations[0].id);
    verify(mockStationService.findByIds(deepEqual([1, 2]))).called();
  });

  // Validation tests
  describe("ZodValidationPipe", () => {
    it("should validate valid lat", () => {
      const pipe = new ZodValidationPipe(locationQuerySchema.shape.lat);
      expect(pipe.execute(45.0, {} as any)).toBe(45.0);
    });

    it("should throw on invalid lat", () => {
      const pipe = new ZodValidationPipe(locationQuerySchema.shape.lat);
      expect(() => pipe.execute(100, {} as any)).toThrow(ZodError);
    });
  });

  describe("ValidationErrorFilter", () => {
    it("should handle ZodError", () => {
      const filter = new ValidationErrorFilter();
      const error = new ZodError([]);
      (error as any).errors = [];
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      filter.catch(error, {} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: [],
      });
    });
  });
});
