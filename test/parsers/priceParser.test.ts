import moment from "moment";
import { PriceParser } from "../../src/parsers/priceParser";
import { getFileAsString } from "../utils/files";
import { describe, it, expect } from "@jest/globals";

describe("PriceParser", () => {
  it("should parse prices, removing first two useless lines", (done) => {
    getFileAsString("test/resources/prezzo_alle_8.csv")
      .then((csvString) => PriceParser.parse(csvString))
      .then((csvData) => {
        expect(csvData.length).toEqual(7);
        done();
      })
      .catch((err) => {
        throw err;
      });
  });

  it("should convert correctly a price", (done) => {
    getFileAsString("test/resources/prezzo_alle_8.csv")
      .then((csvString) => PriceParser.parse(csvString))
      .then((prices) => {
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
        done();
      });
  });
});
