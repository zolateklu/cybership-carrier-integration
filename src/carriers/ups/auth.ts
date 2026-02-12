import axios from 'axios';
import { AuthenticationError } from '../../models/errors';
import { CachedToken, TokenResponse } from '../base/types';

export class UPSAuthManager {
  private cachedToken: CachedToken | null = null;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly authUrl: string
  ) {}

  async getToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    return this.fetchNewToken();
  }

  private async fetchNewToken(): Promise<string> {
    try {
      const response = await axios.post<TokenResponse>(
        this.authUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
          timeout: 10000,
        }
      );

      const { access_token, expires_in } = response.data;
      const expiresAt = Date.now() + (expires_in - 60) * 1000; // Refresh 60s early

      this.cachedToken = { token: access_token, expiresAt };
      return access_token;
    } catch (error) {
      throw new AuthenticationError('UPS', 'Failed to obtain access token', error);
    }
  }

  async refreshToken(): Promise<string> {
    this.cachedToken = null;
    return this.fetchNewToken();
  }
}
