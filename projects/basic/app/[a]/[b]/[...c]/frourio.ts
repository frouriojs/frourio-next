import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  additionalContext: z.object({ token: z.string() }),
  post: {
    res: { 200: { body: z.object({ value: z.array(z.string().or(z.number())) }) } },
  },
} satisfies FrourioSpec;
