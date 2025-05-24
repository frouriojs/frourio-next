import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  post: {
    body: z.instanceof(ArrayBuffer),
    res: { 200: { body: z.instanceof(ArrayBuffer) } },
  },
} satisfies FrourioSpec;
