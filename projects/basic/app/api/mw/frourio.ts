import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

// このミドルウェアが提供するコンテキスト
export const AuthContextSchema = z.object({
  userId: z.string().optional(),
  traceId: z.string(),
});

export const frourioSpec = {
  middleware: {
    context: AuthContextSchema,
  },
  get: {
    res: {
      200: { body: AuthContextSchema }, // ハンドラーが受け取ったコンテキストを返す
    },
  },
} satisfies FrourioSpec;

export type AuthContext = z.infer<typeof AuthContextSchema>;