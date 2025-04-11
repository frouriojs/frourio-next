import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  post: {
    body: z.object({ prompt: z.string() }),
  },
} satisfies FrourioSpec;
