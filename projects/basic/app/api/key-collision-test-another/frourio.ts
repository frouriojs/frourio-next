import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  get: {
    query: z.object({ common: z.string() }),
    res: {
      200: { body: z.object({ data: z.string() }) },
    },
  },
} satisfies FrourioSpec;