import { RateRequest } from '../../models/RateRequest';
import { RateResponse } from '../../models/RateResponse';

export abstract class CarrierClient {
  abstract readonly carrierName: string;

  abstract getRates(request: RateRequest): Promise<RateResponse[]>;
}
