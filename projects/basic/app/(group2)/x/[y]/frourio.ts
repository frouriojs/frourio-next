import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  middleware: true,
  get: {
    query: z.object({ message: z.string() }),
  },
} satisfies FrourioSpec;
