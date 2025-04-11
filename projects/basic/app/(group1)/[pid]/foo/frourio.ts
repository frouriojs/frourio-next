import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  get: {
    res: {
      200: {
        body: z.object({ value: z.string() }),
        headers: z.object({ 'content-type': z.string() }),
      },
    },
  },
} satisfies FrourioSpec;
