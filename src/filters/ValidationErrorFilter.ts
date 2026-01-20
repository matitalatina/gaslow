import { BadRequestHttpResponse, CatchError } from "@inversifyjs/http-core";
import type { ExpressErrorFilter } from "@inversifyjs/http-express";
import type { Request, Response } from "express";
import { ZodError } from "zod";

@CatchError(Error)
export class ValidationErrorFilter implements ExpressErrorFilter {
  catch(error: Error): void {
    if (error.name === "ZodError" || error instanceof ZodError) {
      const zodError = error as ZodError;
      throw new BadRequestHttpResponse({
        message: "Validation failed",
        details: zodError.issues,
      });
    }
    throw error;
  }
}
