import axios from "axios";
import { injectable } from "inversify";
import { Transform, type Readable, type TransformCallback } from "node:stream";
import { DownloadError } from "../errors.js";

export const DOWNLOAD_TIMEOUT_MS = 30_000;
export const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES =
  /^(text\/csv|text\/plain|application\/csv|application\/octet-stream|binary\/octet-stream)\b/i;

class ByteLimitTransform extends Transform {
  private bytes = 0;

  constructor(
    private readonly maxBytes: number,
    private readonly url: string,
  ) {
    super();
  }

  override _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    this.bytes += chunk.length;
    if (this.bytes > this.maxBytes) {
      callback(
        new DownloadError(
          `Response from ${this.url} exceeded ${this.maxBytes} bytes`,
        ),
      );
      return;
    }
    callback(null, chunk);
  }
}

@injectable()
export class CsvDownloader {
  async download(url: string, signal?: AbortSignal): Promise<Readable> {
    const timeoutSignal = AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS);
    const requestSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal;

    let response;
    try {
      response = await axios.get<Readable>(url, {
        responseType: "stream",
        signal: requestSignal,
        timeout: DOWNLOAD_TIMEOUT_MS,
        maxContentLength: MAX_DOWNLOAD_BYTES,
        maxBodyLength: MAX_DOWNLOAD_BYTES,
        headers: {
          Accept: "text/csv, text/plain;q=0.9, application/octet-stream;q=0.8",
        },
      });
    } catch (error) {
      throw new DownloadError(`Failed to download ${url}`, { cause: error });
    }

    const contentType = String(response.headers["content-type"] ?? "");
    if (contentType && !ALLOWED_CONTENT_TYPES.test(contentType)) {
      response.data.destroy();
      throw new DownloadError(
        `Unexpected content type from ${url}: ${contentType}`,
      );
    }

    const contentLength = Number(response.headers["content-length"] ?? 0);
    if (contentLength > MAX_DOWNLOAD_BYTES) {
      response.data.destroy();
      throw new DownloadError(
        `Response from ${url} is too large: ${contentLength} bytes`,
      );
    }

    const limitedStream = new ByteLimitTransform(MAX_DOWNLOAD_BYTES, url);
    response.data.once("error", (error) => {
      if (!limitedStream.destroyed) {
        limitedStream.destroy(
          error instanceof DownloadError
            ? error
            : new DownloadError(`Download failed for ${url}`, { cause: error }),
        );
      }
    });
    limitedStream.once("close", () => response.data.destroy());

    return response.data.pipe(limitedStream);
  }
}
