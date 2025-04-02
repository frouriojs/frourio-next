import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const AuthContextSchema = z.object({
  userId: z.string().optional(),
  traceId: z.string(),
});

export const frourioSpec = {
  middleware: {
    context: AuthContextSchema,
  },
  get: {
    res: {
      200: { body: AuthContextSchema },
    },
  },
} satisfies FrourioSpec;
