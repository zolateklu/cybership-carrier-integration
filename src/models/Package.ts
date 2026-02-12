import { z } from 'zod';

export const PackageSchema = z.object({
  weight: z.number().positive(),
  weightUnit: z.enum(['LBS', 'KGS']).default('LBS'),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  dimensionUnit: z.enum(['IN', 'CM']).default('IN'),
  value: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
});

export type Package = z.infer<typeof PackageSchema>;
