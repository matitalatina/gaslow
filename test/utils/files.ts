import fs from 'fs';

export function getFileAsString(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => (err ? reject(err) : resolve(data.toString())));
  });
}
