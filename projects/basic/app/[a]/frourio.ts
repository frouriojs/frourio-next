import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  param: z.number(),
  middleware: {
    context: z.object({ user: z.object({ name: z.string() })}),
  },
  get: {
    res: { 200: { body: z.number() } },
  },
} satisfies FrourioSpec;
