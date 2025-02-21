import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  get: {
    headers: z.object({ cookie: z.string().optional() }),
    query: z.object({ aa: z.string() }),
    res: {
      200: { body: z.object({ bb: z.string() }) },
      404: {},
    },
  },
  post: {
    body: z.object({ bb: z.number() }),
    res: {
      201: { body: z.array(z.number()), headers: z.object({ 'Set-Cookie': z.string() }) },
    },
  },
} satisfies FrourioSpec;
