import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  get: {
    res: {
      200: {
        body: z.string(),
        headers: z.object({ 'content-type': z.literal('application/json;charset=UTF-8') }),
      },
    },
  },
} satisfies FrourioSpec;
