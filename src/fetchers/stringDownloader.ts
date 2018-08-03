import http from "http";
export class StringDownloader {
  download(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = "";
      const request = http.get(url, function (res) {

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