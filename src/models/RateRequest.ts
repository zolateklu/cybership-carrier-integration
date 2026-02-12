import { z } from 'zod';
import { AddressSchema } from './Address';
import { PackageSchema } from './Package';

export const RateRequestSchema = z.object({
  origin: AddressSchema,
  destination: AddressSchema,
  packages: z.array(PackageSchema).min(1),
  serviceLevel: z.string().optional(),
});

export type RateRequest = z.infer<typeof RateRequestSchema>;
