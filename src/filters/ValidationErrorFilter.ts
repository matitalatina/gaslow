import { BadRequestHttpResponse, CatchError } from "@inversifyjs/http-core";
import { type ExpressErrorFilter } from "@inversifyjs/http-express";
import { ZodError } from "zod";

@CatchError(Error)
export class ValidationErrorFilter implements ExpressErrorFilter {
  catch(error: Error): void {
    if (error instanceof ZodError) {
      throw new BadRequestHttpResponse({
        message: "Validation failed",
        details: error.issues,
      });
    }
    throw error;
  }
}
