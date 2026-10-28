import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { text } from "node:stream/consumers";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CsvDownloader,
  MAX_DOWNLOAD_BYTES,
} from "../../src/fetchers/csvDownloader.js";
import { DownloadError } from "../../src/errors.js";

describe("CsvDownloader", () => {
  let server: Server;
  let baseUrl: string;
  let downloader: CsvDownloader;

  beforeEach(async () => {
    downloader = new CsvDownloader();
    server = createServer((request, response) => {
      switch (request.url) {
        case "/ok":
          response.writeHead(200, { "content-type": "text/csv" });
          response.end("a|b\n1|2\n");
          break;
        case "/html":
          response.writeHead(200, { "content-type": "text/html" });
          response.end("<html></html>");
          break;
        case "/large":
          response.writeHead(200, {
            "content-type": "text/csv",
            "content-length": String(MAX_DOWNLOAD_BYTES + 1),
          });
          response.end();
          break;
        case "/slow":
          break;
        default:
          response.writeHead(404, { "content-type": "text/plain" });
          response.end("Not Found");
      }
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("downloads a CSV as a stream", async () => {
    const stream = await downloader.download(`${baseUrl}/ok`);
    await expect(text(stream)).resolves.toBe("a|b\n1|2\n");
  });

  it("rejects non successful responses", async () => {
    await expect(downloader.download(`${baseUrl}/missing`)).rejects.toThrow(
      DownloadError,
    );
  });

  it("rejects unexpected content types", async () => {
    await expect(downloader.download(`${baseUrl}/html`)).rejects.toThrow(
      /Unexpected content type/,
    );
  });

  it("rejects responses larger than the limit", async () => {
    await expect(downloader.download(`${baseUrl}/large`)).rejects.toThrow(
      /too large/,
    );
  });

  it("aborts a hanging request", async () => {
    await expect(
      downloader.download(`${baseUrl}/slow`, AbortSignal.timeout(100)),
    ).rejects.toThrow(DownloadError);
  });
});
