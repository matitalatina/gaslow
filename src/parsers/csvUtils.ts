import { parse } from "csv-parse";

export async function* parseCsvSkip2Lines(
  csv: string,
): AsyncGenerator<string[]> {
  const parser = parse(csv, {
    delimiter: "|",
    quote: false,
    skip_records_with_error: true,
    from_line: 3,
  });

  for await (const record of parser) {
    yield record as string[];
  }
}
