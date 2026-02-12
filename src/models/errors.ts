export class CarrierAPIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly carrier: string,
    public readonly originalError?: unknown,
    public readonly timestamp: Date = new Date()
  ) {
    super(message);
    this.name = 'CarrierAPIError';
  }
}

export class AuthenticationError extends CarrierAPIError {
  constructor(carrier: string, message: string, originalError?: unknown) {
    super(message, 'AUTH_ERROR', carrier, originalError);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends CarrierAPIError {
  constructor(carrier: string, message: string, originalError?: unknown) {
    super(message, 'VALIDATION_ERROR', carrier, originalError);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends CarrierAPIError {
  constructor(carrier: string, message: string, originalError?: unknown) {
    super(message, 'RATE_LIMIT_ERROR', carrier, originalError);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends CarrierAPIError {
  constructor(carrier: string, message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', carrier, originalError);
    this.name = 'NetworkError';
  }
}
