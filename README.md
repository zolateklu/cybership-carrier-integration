# Cybership Carrier Integration Service

A production-ready TypeScript service for integrating with shipping carrier APIs, starting with UPS Rating API. Designed to be extensible for additional carriers (FedEx, USPS, DHL) and operations (label purchase, tracking).

## Architecture Overview

### Design Principles

1. **Abstraction Layer**: Domain models completely isolated from carrier-specific formats
2. **Extensibility**: Abstract `CarrierClient` base class allows adding new carriers without modifying existing code
3. **Type Safety**: Zod schemas provide runtime validation + compile-time TypeScript types
4. **Transparent Auth**: OAuth token lifecycle (acquisition, caching, refresh) hidden from caller
5. **Structured Errors**: Custom error hierarchy for actionable error handling

### Project Structure

```
src/
├── carriers/
│   ├── base/
│   │   ├── CarrierClient.ts        # Abstract base class
│   │   └── types.ts                # Shared types
│   └── ups/
│       ├── UPSClient.ts            # UPS implementation
│       ├── auth.ts                 # OAuth token manager
│       ├── types.ts                # UPS-specific types
│       └── mappers.ts              # Domain ↔ UPS mapping
├── models/
│   ├── Address.ts                  # Address domain model
│   ├── Package.ts                  # Package domain model
│   ├── RateRequest.ts              # Rate request model
│   ├── RateResponse.ts             # Rate response model
│   └── errors.ts                   # Error hierarchy
├── config/
│   └── env.ts                      # Environment config
└── index.ts                        # Public API
tests/
└── ups.integration.test.ts         # End-to-end tests
```

## Key Design Decisions

### 1. Abstract Base Class Pattern

```typescript
abstract class CarrierClient {
  abstract readonly carrierName: string;
  abstract getRates(request: RateRequest): Promise<RateResponse[]>;
}
```

**Why**: Adding FedEx requires only implementing this interface. No changes to existing UPS code.

### 2. Mapper Pattern

Separate mappers (`UPSMapper`) convert between domain models and carrier-specific formats. Caller never sees UPS's raw JSON structure.

### 3. Token Management

`UPSAuthManager` handles:
- Token acquisition via OAuth 2.0 client credentials
- In-memory caching with expiration tracking
- Automatic refresh 60 seconds before expiry
- Transparent retry on 401 errors

### 4. Error Hierarchy

```typescript
CarrierAPIError (base)
├── AuthenticationError
├── ValidationError
├── RateLimitError
└── NetworkError
```

Each error includes: message, code, carrier name, original error, timestamp.

### 5. Zod for Validation

Runtime validation ensures invalid data never reaches external APIs. TypeScript types derived from schemas eliminate duplication.

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your UPS credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `UPS_CLIENT_ID`: Your UPS API client ID
- `UPS_CLIENT_SECRET`: Your UPS API client secret
- `UPS_API_BASE_URL`: UPS API base URL
- `UPS_AUTH_URL`: UPS OAuth token endpoint

## Usage

```typescript
import { createUPSClient } from './src';

const client = createUPSClient();

const rateRequest = {
  origin: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
  },
  destination: {
    street: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    country: 'US',
  },
  packages: [
    {
      weight: 10,
      weightUnit: 'LBS',
      length: 12,
      width: 8,
      height: 6,
      dimensionUnit: 'IN',
      value: 100,
      currency: 'USD',
    },
  ],
};

try {
  const rates = await client.getRates(rateRequest);
  console.log('Available rates:', rates);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid request:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited, retry later');
  }
}
```

## Running Tests

```bash
npm test
```

Tests use `nock` to stub HTTP responses. No real API calls are made.

### Test Coverage

- ✅ Successful rate request parsing
- ✅ Token acquisition and caching
- ✅ Token refresh on expiry
- ✅ 401 retry with new token
- ✅ 400 validation errors
- ✅ 429 rate limiting
- ✅ 500 server errors
- ✅ Network timeouts
- ✅ Malformed JSON responses
- ✅ Request payload validation

## Development

```bash
# Build
npm run build

# Run example
npm run dev

# Watch mode tests
npm run test:watch
```

## Extending to New Carriers

To add FedEx:

1. Create `src/carriers/fedex/FedExClient.ts` extending `CarrierClient`
2. Implement `getRates()` method
3. Create FedEx-specific types and mappers
4. Add FedEx auth manager if needed
5. Export from `src/index.ts`

**Zero changes required to existing UPS code.**

## What I Would Improve Given More Time

### 1. Additional Operations
- Label purchase API
- Shipment tracking
- Address validation
- Pickup scheduling

### 2. Enhanced Token Management
- Persistent token storage (Redis/database)
- Multi-tenant token management
- Token refresh background job

### 3. Retry Logic
- Exponential backoff for transient failures
- Circuit breaker pattern for degraded services
- Configurable retry policies per carrier

### 4. Observability
- Structured logging (Winston/Pino)
- Metrics (Prometheus)
- Distributed tracing (OpenTelemetry)
- Request/response logging with PII redaction

### 5. Rate Optimization
- Parallel rate requests to multiple carriers
- Response caching with TTL
- Rate comparison utilities

### 6. Production Hardening
- Request/response schema validation
- Rate limiting on our side
- Health check endpoints
- Graceful shutdown handling

### 7. Developer Experience
- OpenAPI/Swagger documentation
- Postman collection
- Docker compose for local development
- CI/CD pipeline configuration

### 8. Testing
- Unit tests for mappers and utilities
- Contract tests against carrier API specs
- Load testing
- Chaos engineering tests

### 9. Configuration
- Support for multiple carrier accounts
- Environment-specific configurations
- Feature flags for gradual rollouts

### 10. Security
- Secrets management (AWS Secrets Manager, Vault)
- Request signing
- IP whitelisting
- Audit logging

## API Documentation

### RateRequest

```typescript
{
  origin: Address;
  destination: Address;
  packages: Package[];
  serviceLevel?: string; // Optional carrier-specific service code
}
```

### RateResponse

```typescript
{
  carrier: string;
  service: string;
  rate: number;
  currency: string;
  deliveryDate?: string;
  transitDays?: number;
}
```

### Error Types

All errors extend `CarrierAPIError` with:
- `message`: Human-readable error description
- `code`: Machine-readable error code
- `carrier`: Carrier name
- `originalError`: Original error object
- `timestamp`: Error occurrence time

## License

MIT
