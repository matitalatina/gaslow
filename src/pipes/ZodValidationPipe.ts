import type { Pipe, PipeMetadata } from "@inversifyjs/http-core";
import { z } from "zod";

export class ZodValidationPipe<T> implements Pipe<unknown, T> {
  constructor(
    private schema: z.ZodType<T>,
  ) {}

  execute(value: unknown, _metadata: PipeMetadata): T {
    return this.schema.parse(value);
  }
}
