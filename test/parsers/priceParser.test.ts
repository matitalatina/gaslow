import moment from "moment";
import { PriceParser } from "../../src/parsers/priceParser.js";
import { getFileAsString } from "../utils/files.js";
import { Readable } from "node:stream";
import { describe, it, expect, beforeEach } from "vitest";

describe("PriceParser", () => {
  let priceParser: PriceParser;

  beforeEach(() => {
    priceParser = new PriceParser();
  });

  it("should parse prices, removing first two useless lines", async () => {
    const csvString = await getFileAsString("test/resources/prezzo_alle_8.csv");
    const csvData = await priceParser.parse(csvString);
    expect(csvData.length).toEqual(6);
  });

  it("should parse a price CSV stream", async () => {
    const csvString = await getFileAsString("test/resources/prezzo_alle_8.csv");
    const chunks = Array.from(
      { length: Math.ceil(csvString.length / 32) },
      (_, index) => csvString.slice(index * 32, (index + 1) * 32),
    );

    const prices = await priceParser.parse(Readable.from(chunks));

    expect(prices.length).toEqual(6);
    expect(prices[0].idStation).toEqual(3471);
  });

  it("should convert correctly a price", async () => {
    const csvString = await getFileAsString("test/resources/prezzo_alle_8.csv");
    const prices = await priceParser.parse(csvString);
    const price = prices[0];
    expect(price.idStation).toEqual(3471);
    expect(price.fuelType).toEqual("Benzina");
    expect(price.price).toEqual(2.229);
    expect(price.isSelf).toBeFalsy();
    expect(
      moment("12/03/2026 16:30:11", "DD/MM/YYYY HH:mm:ss").isSame(
        price.updatedAt,
      ),
    ).toBeTruthy();
  });
});
