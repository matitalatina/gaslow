import { createSandbox, SinonStub } from 'sinon';
import { cleanUpMetadata } from 'inversify-express-utils';
import {
  mock, instance, reset, when, deepEqual,
} from 'ts-mockito';
import { StationService } from '../../src/services/stationService';
import { StationsController } from '../../src/controllers/stationController';
import { aStation } from '../utils/fixtures';

const sandbox = createSandbox();
const mockStationService = mock(StationService);

const controller = new StationsController(instance(mockStationService));

describe('StationController', () => {
  beforeEach(() => {
    cleanUpMetadata();
  });

  afterEach(() => {
    sandbox.restore();
    reset(mockStationService);
  });

  it('should update stations', () => {
    const updateStationStub = sandbox.stub(StationService, 'updateStationCollection').returns(Promise.resolve(undefined));
    const req: any = {};
    const res: any = {
      json: sandbox.stub(),
    };
    return controller.updateStationCollection(req, res).then(() => {
      expect((res.json as sinon.SinonStub).calledOnce).toBeTruthy();
      expect(updateStationStub.calledOnce).toBeTruthy();
    });
  });

  it('should findNearestByCoordinates', () => {
    const serviceFind = sandbox.stub(StationService, 'findNearestByCoordinates').returns(Promise.resolve([aStation()]));
    const req: any = {
      query: {
        lat: 1.0,
        lng: 2.0,
      },
    };
    const res: any = {
      json: sandbox.stub(),
    };
    return controller.findNearestByCoordinates(req, res)
      .then(() => {
        const jsonStub = (res.json as SinonStub);
        expect(jsonStub.calledOnce).toBeTruthy();
        expect(jsonStub.args[0][0].items[0].id).toEqual(aStation().id);
      });
  });

  it('should findNearestByRoute', () => {
    const from = { lat: 1, lng: 2 };
    const to = { lat: -3.3, lng: 4.4 };
    when(mockStationService.findOnTheRoute(deepEqual(from), deepEqual(to))).thenResolve([aStation()]);
    const req: any = {
      query: {
        from: '1.0,2.0',
        to: '-3.3,4.4',
      },
    };
    const res: any = {
      json: sandbox.stub(),
    };
    return controller.findOnTheRoute(req, res)
      .then(() => {
        const jsonStub = (res.json as SinonStub);
        expect(jsonStub.calledOnce).toBeTruthy();
        expect(jsonStub.args[0][0].items[0].id).toEqual(aStation().id);
      });
  });
});
