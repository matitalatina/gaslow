import { cleanUpMetadata } from 'inversify-express-utils'
import {
  mock, instance, reset, when, deepEqual, verify, anyNumber
} from 'ts-mockito'
import { StationService } from '../../src/services/stationService'
import { StationsController } from '../../src/controllers/stationController'
import { aStation } from '../utils/fixtures'
import { range } from 'lodash'

const mockStationService = mock(StationService)

const controller = new StationsController(instance(mockStationService))

describe('StationController', () => {
  beforeEach(() => {
    cleanUpMetadata()
  })

  afterEach(() => {
    reset(mockStationService)
  })

  it('should update stations', () => {
    when(mockStationService.updateStationCollection()).thenResolve(undefined)
    const req: any = {}
    const json = jest.fn()
    const res: any = {
      json
    }
    return controller.updateStationCollection(req, res).then(() => {
      expect(json.mock.calls.length).toBe(1)
      verify(mockStationService.updateStationCollection()).called()
    })
  })

  it('should findNearestByCoordinates', () => {
    when(mockStationService.findNearestByCoordinates(anyNumber(), anyNumber())).thenResolve([aStation()])
    const req: any = {
      query: {
        lat: 1.0,
        lng: 2.0
      }
    }
    const json = jest.fn()
    const res: any = {
      json
    }
    return controller.findNearestByCoordinates(req, res)
      .then(() => {
        expect(json.mock.calls.length).toBe(1)
        expect(json.mock.calls[0][0].items[0].id).toBe(aStation().id)
      })
  })

  it('should findNearestByRoute', () => {
    const from = { lat: 1, lng: 2 }
    const to = { lat: -3.3, lng: 4.4 }
    when(mockStationService.findOnTheRoute(deepEqual(from), deepEqual(to))).thenResolve([aStation()])
    const req: any = {
      query: {
        from: '1.0,2.0',
        to: '-3.3,4.4'
      }
    }
    const json = jest.fn()
    const res: any = {
      json
    }
    return controller.findOnTheRoute(req, res)
      .then(() => {
        expect(json.mock.calls.length).toBe(1)
        expect(json.mock.calls[0][0].items[0].id).toEqual(aStation().id)
      })
  })

  it('should findByIds', async () => {
    const stations = range(2).map(aStation)
    when(mockStationService.findByIds(deepEqual([1, 2]))).thenResolve(stations)
    const req: any = {
      query: {
        ids: '1,2'
      }
    }
    const json = jest.fn()
    const res: any = {
      json
    }

    await controller.findByIds(req, res)

    expect(json.mock.calls.length).toBe(1)
    expect(json.mock.calls[0][0].items[0].id).toBe(stations[0].id)
    verify(mockStationService.findByIds(deepEqual([1, 2]))).called()
  })
})
