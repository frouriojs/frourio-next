import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  post: {
    body: z.object({ prompt: z.string() }),
    // No 'res' defined, handler must return a Response object
  },
} satisfies FrourioSpec;