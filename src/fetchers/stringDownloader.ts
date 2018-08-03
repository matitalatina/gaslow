import http from "http";
import https from "https";
export class StringDownloader {
  download(url: string): Promise<string> {
    const fetcher: any = url.toLowerCase().startsWith("https") ? https : http;
    return new Promise((resolve, reject) => {
      let data = "";
      const request = fetcher.get(url, function (res: any) {

        res.on("data", function (chunk: string) {
          data += chunk;
        });

        res.on("end", function () {
          resolve(data);
        });
      });

      request.on("error", function (e) {
        reject(e);
      });
    });
  }
}