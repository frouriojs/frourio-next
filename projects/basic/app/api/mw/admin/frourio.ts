import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';
import { AuthContextSchema, type AuthContext } from '../frourio'; // 親のコンテキスト型とスキーマをインポート

// このミドルウェアが提供する追加のコンテキスト
const AdminContextSchema = z.object({
  isAdmin: z.boolean(),
  permissions: z.array(z.string()),
});

export const frourioSpec = {
  // 親ミドルウェア(AuthContext)を継承し、新しいコンテキスト(AdminContext)を定義
  middleware: {
    context: AdminContextSchema,
  },
  // /api/mw/admin のルート
  get: {
    res: {
      // ハンドラーは結合されたコンテキストを受け取る
      200: { body: AuthContextSchema.merge(AdminContextSchema) },
      403: { body: z.object({ message: z.string() }) }, // Forbidden
    },
  },
  post: {
    body: z.object({ data: z.string() }),
    res: {
      201: { body: z.object({ received: z.string(), context: AuthContextSchema.merge(AdminContextSchema) }) },
      403: { body: z.object({ message: z.string() }) }, // Forbidden
    },
  },
} satisfies FrourioSpec;

// 結合されたコンテキスト型をエクスポート
export type FullAdminContext = AuthContext & z.infer<typeof AdminContextSchema>;
export type AdminContext = z.infer<typeof AdminContextSchema>;