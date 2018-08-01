import moment from "moment";
import fs from "fs";
import { PriceParser } from "../../src/parsers/priceParser";

import chai from "chai";
import { resolve } from "url";
import { getFileAsString } from "../utils/files";

const expect = chai.expect;

describe("PriceParser", () => {
  it("should parse prices, removing first two useless lines", (done) => {
    getFileAsString("test/resources/prezzo_alle_8.csv").then((csvString) => {
      return new PriceParser().parse(csvString);
    })
      .then((csvData) => {
        expect(csvData.length).is.equal(7);
        done();
      })
      .catch((err) => {
        done.fail("Failed :( ");
      });
  });

  it("should convert correctly a price", (done) => {
    getFileAsString("test/resources/prezzo_alle_8.csv").then((csvString) => {
      return new PriceParser().parse(csvString);
    })
      .then((prices) => {
        const price = prices[0];
        expect(price.idStation).to.be.eq(3464);
        expect(price.fuelType).to.be.eq("Benzina");
        expect(price.price).to.be.eq(1.929);
        expect(price.isSelf).to.be.false;
        expect(moment("26/07/2018 21:30:16", "DD/MM/YYYY HH:mm:ss").isSame(price.updatedAt)).to.be.true;
        done();
      });
  });
});
