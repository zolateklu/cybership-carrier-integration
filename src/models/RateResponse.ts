import { z } from 'zod';

export const RateResponseSchema = z.object({
  carrier: z.string(),
  service: z.string(),
  rate: z.number().positive(),
  currency: z.string().length(3),
  deliveryDate: z.string().optional(),
  transitDays: z.number().int().positive().optional(),
});

export type RateResponse = z.infer<typeof RateResponseSchema>;
