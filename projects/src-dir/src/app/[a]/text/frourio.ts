import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  post: {
    body: z.string(),
    res: { 200: { body: z.string() } },
  },
} satisfies FrourioSpec;
