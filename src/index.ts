import { UPSClient } from './carriers/ups/UPSClient';
import { env } from './config/env';

export { UPSClient } from './carriers/ups/UPSClient';
export { CarrierClient } from './carriers/base/CarrierClient';
export * from './models/RateRequest';
export * from './models/RateResponse';
export * from './models/Address';
export * from './models/Package';
export * from './models/errors';

export function createUPSClient(): UPSClient {
  return new UPSClient(
    env.UPS_CLIENT_ID,
    env.UPS_CLIENT_SECRET,
    env.UPS_API_BASE_URL,
    env.UPS_AUTH_URL
  );
}

// Usage example
async function example() {
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
        weightUnit: 'LBS' as const,
        length: 12,
        width: 8,
        height: 6,
        dimensionUnit: 'IN' as const,
        value: 100,
        currency: 'USD',
      },
    ],
  };

  try {
    const rates = await client.getRates(rateRequest);
    console.log('Available rates:', rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
  }
}

if (require.main === module) {
  example();
}
