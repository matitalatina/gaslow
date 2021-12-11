import fs from 'fs'
import moment from 'moment'
import { IStationDocument, Price, Station } from '../../src/models/Station'
import { CsvPrice } from '../../src/parsers/models/csvPrice'
import { CsvStation } from '../../src/parsers/models/csvStation'

export function aPrice (): Price {
  return {
    fuelType: 'Benzina',
    price: 1.45,
    isSelf: true,
    updatedAt: new Date()
  }
}
export function aStation (i: number = 1): IStationDocument {
  return new Station({
    id: i,
    manager: `manager${i}`,
    brand: `brand${i}`,
    type: `type${i}`,
    name: `name${i}`,
    address: `address${i}`,
    city: `city${i}`,
    province: `province${i}`,
    location: {
      type: 'Point',
      coordinates: [i * 2.0, i * 1.0]
    },
    prices: [
      aPrice()
    ]
  })
}

export function aCsvStation (i: number = 1): CsvStation {
  return {
    id: i,
    manager: `manager${i}`,
    brand: `brand${i}`,
    type: `type${i}`,
    name: `name${i}`,
    address: `address${i}`,
    city: `city${i}`,
    province: `province${i}`,
    latitude: 1.0,
    longitude: 2.0
  }
}

export function aCsvPrice (i: number = 1): CsvPrice {
  return {
    idStation: i,
    fuelType: `fuelType${i}`,
    price: i,
    isSelf: true,
    updatedAt: moment(123).toDate()
  }
}
export function aGoogleMapsApiDirectionResponse (): string {
  return fs.readFileSync(`${__dirname}/../assets/googleMapsApiDirectionResponse.json`, 'utf-8')
}
