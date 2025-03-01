import { parse } from "csv-parse";
import { decode } from "html-entities";

export function parseCsvSkip2Lines(csv: string): Promise<Array<string[]>> {
  return new Promise((resolve, reject) => {
    // We need to remove first two line in some way.
    const csvLines = csv.split("\n").map((l) => decode(l));
    csvLines.shift();
    csvLines.shift();
    
    // Updated to use the newer API style for csv-parse 5.5.3
    const parser = parse(csvLines.join("\n"), {
      delimiter: ";",
      quote: false,
      skip_records_with_error: true
    });
    
    const records: Array<string[]> = [];
    
    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });
    
    parser.on('error', function(err) {
      reject(err);
    });
    
    parser.on('end', function() {
      resolve(records);
    });
  });
}
