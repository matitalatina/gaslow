import { StringDownloader } from "../../src/fetchers/stringDownloader";
import { describe, it, expect } from "@jest/globals";

describe("StringDownloader", () => {
  it("should download the README.md as string (https)", async () => {
    const file = await StringDownloader.download(
      "https://raw.githubusercontent.com/matitalatina/gaslow/master/README.md",
    );
    expect(file).toContain("# Gaslow project");
  });
});
