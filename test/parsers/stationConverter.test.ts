import moment from "moment";
import { range, flatten, find } from "lodash";
import { StationConverter } from "../../src/parsers/stationConverter";
import { IStation, Price } from "../../src/models/Station";
import { CsvPrice } from "../../src/parsers/models/csvPrice";
import { CsvStation } from "../../src/parsers/models/csvStation";
import { describe, it, expect, beforeEach } from "vitest";

describe("StationConverter", () => {
  let stationConverter: StationConverter;

  beforeEach(() => {
    stationConverter = new StationConverter();
  });

  it("should create a station from csvStations and csvPrices", () => {
    const csvStations: CsvStation[] = range(4).map((i) => ({
      id: i,
      manager: `manager${i}`,
      brand: `brand${i}`,
      type: `type${i}`,
      name: `name${i}`,
      address: `address${i}`,
      city: `city${i}`,
      province: `province${i}`,
      latitude: 1.0,
      longitude: 2.0,
    }));
    const csvPrices: CsvPrice[] = flatten(
      range(4).map((i) =>
        range(4).map((j) => {
          const idPrice = i * 100 + j;
          return {
            idStation: i,
            fuelType: `fuelType${idPrice}`,
            price: idPrice,
            isSelf: true,
            updatedAt: moment(idPrice).toDate(),
          };
        }),
      ),
    );
    const stations: IStation[] = stationConverter.merge(csvStations, csvPrices);
    expect(stations.length).toEqual(4);
    const firstStation = stations[0];
    expect(firstStation.id).toEqual(0);
    expect(firstStation.manager).toEqual("manager0");
    expect(firstStation.brand).toEqual("brand0");
    expect(firstStation.type).toEqual("type0");
    expect(firstStation.name).toEqual("name0");
    expect(firstStation.address).toEqual("address0");
    expect(firstStation.city).toEqual("city0");
    expect(firstStation.province).toEqual("province0");
    expect(firstStation.location.coordinates[1]).toEqual(1.0);
    expect(firstStation.location.coordinates[0]).toEqual(2.0);

    const secondStation = stations[1];
    const price = find(secondStation.prices, {
      fuelType: "fuelType102",
      price: 102,
      isSelf: true,
    }) as Price;
    expect(moment(price.updatedAt).isSame(moment(102))).toEqual(true);
  });
});
