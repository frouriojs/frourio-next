import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  middleware: { context: z.object({ user: z.object({ name: z.string() }) }) },
} satisfies FrourioSpec;
