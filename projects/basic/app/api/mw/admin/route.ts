import { createRoute } from './frourio.server';
import type { AuthContext } from '../frourio'; // 親コンテキスト
import type { AdminContext, FullAdminContext } from './frourio'; // 現在のコンテキストと結合コンテキスト

// ネストされたミドルウェアの実装
export const { middleware, GET, POST } = createRoute({
  // /api/mw/admin のミドルウェア
  // 親ミドルウェアからAuthContextを受け取る
  middleware: async ({ req, next }, parentContext: AuthContext) => {
    console.log('Admin Middleware (/api/mw/admin): Received parent context:', parentContext);

    // 親コンテキストのuserIdに基づいて管理者権限を決定
    const isAdmin = parentContext.userId === 'user-admin';
    const permissions = isAdmin ? ['read', 'write', 'delete'] : ['read'];

    const url = new URL(req.url);
    const isAdminRoute = url.pathname === '/api/mw/admin'; // パスが /api/mw/admin かどうか

    // アクセス制御ロジック
    if (!isAdmin) { // 管理者でない場合
      if (isAdminRoute && req.method === 'GET') {
        // /api/mw/admin へのGETリクエストは許可
        console.log('Admin Middleware: Allowing non-admin GET to /api/mw/admin');
      } else {
        // それ以外のリクエストは禁止
        console.log(`Admin Middleware: Forbidden access for non-admin user to ${req.method} ${url.pathname}`);
        return new Response(JSON.stringify({ message: 'Forbidden: Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // 許可された場合、または管理者の場合は次のハンドラー/ミドルウェアへ
    return next(req, { isAdmin, permissions }); // AdminContextSchemaに一致する必要がある
  },

  // GET /api/mw/admin
  // 結合されたコンテキスト(FullAdminContext)を受け取る
  get: async (req, context: FullAdminContext) => {
    console.log('GET Handler (/api/mw/admin): Received full context:', context);
    // 管理者でない場合でもGETは許可されている
    return { status: 200, body: context };
  },

  // POST /api/mw/admin
  // 結合されたコンテキスト(FullAdminContext)を受け取る
  post: async ({ body }, context: FullAdminContext) => {
    console.log('POST Handler (/api/mw/admin): Received full context:', context);
    console.log('POST Handler (/api/mw/admin): Received body:', body);
    // このハンドラーはミドルウェアによって管理者のみアクセス可能
    return { status: 201, body: { received: body.data, context } };
  },
});