import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  param: z.array(z.string()),
  get: {
    res: { 200: { body: z.string() } },
  },
} satisfies FrourioSpec;
