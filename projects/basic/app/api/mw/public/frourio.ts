import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  // このルートにはミドルウェアを定義しない
  // 親のミドルウェアも継承しない (app/api/frourio.ts はミドルウェアのみ定義)
  get: {
    res: {
      200: { body: z.object({ message: z.string() }) },
    },
  },
} satisfies FrourioSpec;