import moment from "moment";
import { PriceParser } from "../../src/parsers/priceParser";
import { getFileAsString } from "../utils/files";
import { describe, it, expect, beforeEach } from "vitest";

describe("PriceParser", () => {
  let priceParser: PriceParser;

  beforeEach(() => {
    priceParser = new PriceParser();
  });

  it("should parse prices, removing first two useless lines", async () => {
    const csvString = await getFileAsString("test/resources/prezzo_alle_8.csv");
    const csvData = await priceParser.parse(csvString);
    expect(csvData.length).toEqual(7);
  });

  it("should convert correctly a price", async () => {
    const csvString = await getFileAsString("test/resources/prezzo_alle_8.csv");
    const prices = await priceParser.parse(csvString);
    const price = prices[0];
    expect(price.idStation).toEqual(3464);
    expect(price.fuelType).toEqual("Benzina");
    expect(price.price).toEqual(1.929);
    expect(price.isSelf).toBeFalsy();
    expect(
      moment("26/07/2018 21:30:16", "DD/MM/YYYY HH:mm:ss").isSame(
        price.updatedAt,
      ),
    ).toBeTruthy();
  });
});
