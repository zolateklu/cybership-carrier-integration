import axios, { AxiosError } from 'axios';
import { CarrierClient } from '../base/CarrierClient';
import { RateRequest, RateRequestSchema } from '../../models/RateRequest';
import { RateResponse } from '../../models/RateResponse';
import { UPSAuthManager } from './auth';
import { UPSMapper } from './mappers';
import { UPSRateResponse } from './types';
import {
  ValidationError,
  NetworkError,
  RateLimitError,
  CarrierAPIError,
} from '../../models/errors';

export class UPSClient extends CarrierClient {
  readonly carrierName = 'UPS';
  private authManager: UPSAuthManager;

  constructor(
    clientId: string,
    clientSecret: string,
    private readonly apiBaseUrl: string,
    authUrl: string
  ) {
    super();
    this.authManager = new UPSAuthManager(clientId, clientSecret, authUrl);
  }

  async getRates(request: RateRequest): Promise<RateResponse[]> {
    const validated = RateRequestSchema.parse(request);
    const upsRequest = UPSMapper.toUPSRateRequest(validated);

    try {
      return await this.makeRateRequest(upsRequest);
    } catch (error) {
      if (this.isAuthError(error)) {
        await this.authManager.refreshToken();
        return await this.makeRateRequest(upsRequest);
      }
      throw error;
    }
  }

  private async makeRateRequest(upsRequest: unknown): Promise<RateResponse[]> {
    try {
      const token = await this.authManager.getToken();
      const response = await axios.post<UPSRateResponse>(
        `${this.apiBaseUrl}/rating/v1/rate`,
        upsRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      return UPSMapper.fromUPSRateResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private isAuthError(error: unknown): boolean {
    return (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    );
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return new NetworkError(this.carrierName, 'Request timeout', error);
      }

      if (!axiosError.response) {
        return new NetworkError(this.carrierName, 'Network error', error);
      }

      const status = axiosError.response.status;

      if (status === 400) {
        return new ValidationError(
          this.carrierName,
          'Invalid request parameters',
          error
        );
      }

      if (status === 429) {
        return new RateLimitError(
          this.carrierName,
          'Rate limit exceeded',
          error
        );
      }

      if (status >= 500) {
        return new CarrierAPIError(
          'UPS service error',
          'SERVER_ERROR',
          this.carrierName,
          error
        );
      }
    }

    return new CarrierAPIError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      this.carrierName,
      error
    );
  }
}
