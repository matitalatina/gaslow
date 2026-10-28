import { parse } from "csv-parse";
import type { Readable } from "node:stream";

const CSV_OPTIONS = {
  delimiter: "|",
  quote: false,
  skip_records_with_error: true,
  from_line: 3,
};

export async function* parseCsvSkip2Lines(
  input: string | Readable,
): AsyncGenerator<string[]> {
  const parser =
    typeof input === "string" ? parse(input, CSV_OPTIONS) : parse(CSV_OPTIONS);

  if (typeof input !== "string") {
    input.once("error", (error) => parser.destroy(error));
    parser.once("close", () => input.destroy());
    input.pipe(parser);
  }

  for await (const record of parser) {
    yield record as string[];
  }
}
