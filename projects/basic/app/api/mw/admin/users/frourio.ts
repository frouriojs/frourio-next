import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';
import type { FullAdminContext } from '../frourio'; // 親の結合コンテキスト型をインポート

export const frourioSpec = {
  // 親ミドルウェアを継承し、独自のミドルウェアロジックを実行する (コンテキストは変更しない)
  middleware: true,

  get: {
    query: z.object({ role: z.string().optional() }),
    res: {
      // ハンドラーは親から継承したFullAdminContextをそのまま受け取る
      200: { body: z.object({ context: z.any(), users: z.array(z.string()) }) },
      403: { body: z.object({ message: z.string() }) }, // 親ミドルウェアが返す可能性
    },
  },
} satisfies FrourioSpec;

// 親から継承したコンテキスト型をそのままエクスポート
export type { FullAdminContext };