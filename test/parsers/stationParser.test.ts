import { CsvStation } from '../../src/parsers/models/csvStation'
import StationParser from '../../src/parsers/stationParser'
import { getFileAsString } from '../utils/files'

describe('StationParser', () => {
  let parsedStations: Promise<Array<CsvStation>>

  beforeEach(() => {
    parsedStations = getFileAsString('test/resources/anagrafica_impianti_attivi.csv')
      .then((csvString) => StationParser.parse(csvString))
  })

  it('should parse the csv skipping the first two lines', (done) => {
    parsedStations
      .then((csvLines) => {
        expect(csvLines.length).toEqual(3)
        done()
      })
  })

  it('should parse correctly the station', (done) => {
    parsedStations
      .then((stations) => {
        const firstStation = stations[0]
        expect(firstStation.id).toEqual(3464)
        expect(firstStation.manager).toEqual('STAZ.SERV.PO EST ANDREOTTI CLAUDIO DI ANDREOTTI OMAR E C. SNC')
        expect(firstStation.brand).toEqual('Total Erg')
        expect(firstStation.type).toEqual('Autostradale')
        expect(firstStation.name).toEqual('PO EST')
        expect(firstStation.address).toEqual('Autostrada A13 BOLOGNA-PADOVA, Km. 43+400, dir. Nord 44100')
        expect(firstStation.city).toEqual('FERRARA')
        expect(firstStation.province).toEqual('FE')
        expect(firstStation.latitude).toEqual(44.88011856623546)
        expect(firstStation.longitude).toEqual(11.570832944774565)
        done()
      })
  })
})
