import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  param: z.array(z.string()).optional(),
  get: {
    res: { 200: { body: z.string() } },
  },
} satisfies FrourioSpec;
