import { StationConverter } from "./../../src/parsers/stationConverter";
import chai from "chai";
import { IStation, Price } from "./../../src/models/Station";
import moment from "moment";
import { CsvPrice } from "./../../src/parsers/models/csvPrice";
import { CsvStation } from "./../../src/parsers/models/csvStation";
import { range, flatten } from "lodash";
import { find } from "lodash";

const expect = chai.expect;

describe("StationConverter", () => {
  it("should create a station from csvStations and csvPrices", () => {
    const csvStations: CsvStation[] = range(4).map(i => ({
      id: i,
      manager: "manager" + i,
      brand: "brand" + i,
      type: "type" + i,
      name: "name" + i,
      address: "address" + i,
      city: "city" + i,
      province: "province" + i,
      latitude: 1.0,
      longitude: 2.0,
    }));
    const csvPrices: CsvPrice[] = flatten(range(4).map((i) => {
      return range(4).map(j => {
        const idPrice = i * 100 + j;
        return {
          idStation: i,
          fuelType: "fuelType" + idPrice,
          price: idPrice,
          isSelf: true,
          updatedAt: moment(idPrice).toDate(),
        };
      });
    }));
    const stations: IStation[] = StationConverter.merge(csvStations, csvPrices);
    expect(stations.length).to.be.eq(4);
    const firstStation = stations[0];
    expect(firstStation.id).to.be.eq(0);
    expect(firstStation.manager).to.be.eq("manager0");
    expect(firstStation.brand).to.be.eq("brand0");
    expect(firstStation.type).to.be.eq("type0");
    expect(firstStation.name).to.be.eq("name0");
    expect(firstStation.address).to.be.eq("address0");
    expect(firstStation.city).to.be.eq("city0");
    expect(firstStation.province).to.be.eq("province0");
    expect(firstStation.location.coordinates[1]).to.be.eq(1.0);
    expect(firstStation.location.coordinates[0]).to.be.eq(2.0);

    const secondStation = stations[1];
    const price = (find(secondStation.prices, {
      fuelType: "fuelType102",
      price: 102,
      isSelf: true,
    }) as Price);
    expect(moment(price.updatedAt).isSame(moment(102))).to.be.true;
  });
});