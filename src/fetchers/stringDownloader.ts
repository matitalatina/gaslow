import request from "request-promise";
export class StringDownloader {
  static download(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      request(url).then(resolve).catch(reject);
    });
  }
}