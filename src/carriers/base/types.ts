export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface CachedToken {
  token: string;
  expiresAt: number;
}
