import { StringDownloader } from "../../src/fetchers/stringDownloader";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("StringDownloader", () => {
  // Create a new instance of the axios mock adapter
  const axiosMock = new MockAdapter(axios);

  // Sample response data
  const sampleResponse = "# Gaslow project\n\nSome content here";

  beforeEach(() => {
    // Set up the mock response before each test
    axiosMock
      .onGet(
        "https://raw.githubusercontent.com/matitalatina/gaslow/master/README.md",
      )
      .reply(200, sampleResponse);

    // Set up a mock error response
    axiosMock.onGet("https://example.com/not-found").reply(404, "Not Found");
  });

  afterEach(() => {
    // Reset the mock after each test
    axiosMock.reset();
  });

  it("should download the README.md as string (https)", async () => {
    const file = await StringDownloader.download(
      "https://raw.githubusercontent.com/matitalatina/gaslow/master/README.md",
    );
    expect(file).toContain("# Gaslow project");
  });

  it("should handle errors correctly", async () => {
    await expect(
      StringDownloader.download("https://example.com/not-found"),
    ).rejects.toThrow();
  });
});
