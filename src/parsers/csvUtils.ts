import { parse } from 'csv-parse'
import { decode } from 'html-entities'

export function parseCsvSkip2Lines (csv: string): Promise<Array<string[]>> {
  return new Promise((resolve, reject) => {
    // We need to remove first two line in some way.
    const csvLines = csv.split('\n').map(l => decode(l))
    csvLines.shift()
    csvLines.shift()
    parse(csvLines.join('\n'), { delimiter: ';', quote: false, skip_records_with_error: true }, (err, output) => {
      err ? reject(err) : resolve(output)
    })
  })
}
