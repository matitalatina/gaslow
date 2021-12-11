import { Request, Response } from 'express'
import {
  interfaces, controller, httpGet, httpPost, request, response
} from 'inversify-express-utils'
import { inject } from 'inversify'
import { TYPES } from '../di/types'
import { StationService } from '../services/stationService'

@controller('/stations')
export class StationsController implements interfaces.Controller {
  constructor (
    @inject(TYPES.StationService) private stationService: StationService
  ) {

  }

  @httpPost('/update')
  updateStationCollection (@request() req: Request, @response() res: Response): Promise<void> {
    return StationService.updateStationCollection().then(() => {
      res.json({ message: 'Finished!' })
    })
  }

  @httpGet('/find/location')
  findNearestByCoordinates (@request() req: Request, @response() res: Response): Promise<void> {
    return StationService.findNearestByCoordinates(+req.query.lat, +req.query.lng).then((stations) => {
      res.json({ items: stations })
    })
  }

  @httpGet('/find/route')
  async findOnTheRoute (@request() req: Request, @response() res: Response) {
    const [fromLat, fromLng] = (req.query.from as string).split(',').map((n: string) => parseFloat(n))
    const [toLat, toLng] = (req.query.to as string).split(',').map((n: string) => parseFloat(n))
    const stations = await this.stationService.findOnTheRoute(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng }
    )
    res.json({ items: stations })
  }
}
