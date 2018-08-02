import { Station } from "../../src/models/Station";

export function aStation(i: number = 1) {
  return new Station({
    id: i,
    manager: "manager" + i,
    brand: "brand" + i,
    type: "type" + i,
    name: "name" + i,
    address: "address" + i,
    city: "city" + i,
    province: "province" + i,
    location: {
      type: "Point",
      coordinates: [2.0, 1.0]
    },
    prices: [{
      fuelType: "fuelType",
      price: 1.45,
      isSelf: true,
      updatedAt: new Date(123),
    }],
  });
}