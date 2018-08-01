import parse from "csv-parse";
export function parseCsvSkip2Lines(csv: string): Promise<Array<string[]>> {
  return new Promise((resolve, reject) => {
    // We need to remove first two line in some way.
    const csvLines = csv.split("\n");
    csvLines.shift();
    csvLines.shift();
    parse(csvLines.join("\n"), { delimiter: ";" }, (err, output) => {
      err ? reject(err) : resolve(output);
    });
  });
}