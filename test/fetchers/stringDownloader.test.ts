import { StringDownloader } from "./../../src/fetchers/stringDownloader";
import chai from "chai";

const expect = chai.expect;

describe("StringDownloader", () => {
  it("should download the README.md as string", () => {
    new StringDownloader()
      .download("https://raw.githubusercontent.com/matitalatina/gaslow/master/README.md")
      .then((file) => {
        expect(file).to.contains("GasLow");
      });
  });
});