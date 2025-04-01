import { createRoute } from './frourio.server';
import type { AuthContext } from './frourio';
import { randomUUID } from 'crypto';

// ルートミドルウェアの実装
export const { middleware, GET } = createRoute({
  middleware: async ({ req, next }) => {
    const authorization = req.headers.get('Authorization');
    const traceId = req.headers.get('X-Trace-Id') ?? randomUUID();
    const userId = authorization?.startsWith('Bearer user-') ? authorization.split(' ')[1] : undefined;

    console.log(`Root Middleware (/api/mw): userId=${userId}, traceId=${traceId}`);

    // AuthContextを次のハンドラー/ミドルウェアに渡す
    return next(req, { userId, traceId }); // AuthContextSchemaに一致する必要がある
  },

  // GET /api/mw
  // ミドルウェアからAuthContextを受け取る
  get: async (req, context: AuthContext) => {
    console.log('GET Handler (/api/mw): Received context:', context);
    // 受け取ったコンテキストをそのまま返す
    return { status: 200, body: context };
  },
});