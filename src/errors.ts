export class DownloadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DownloadError";
  }
}

export class UpdateMemoryLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpdateMemoryLimitError";
  }
}
