import { createRoute } from './frourio.server';
import type { FullAdminContext } from './frourio'; // 親から継承したコンテキスト
// Responseオブジェクトはグローバルなのでインポート不要

// このルートは独自のミドルウェアロジックを持つ
export const { middleware, GET } = createRoute({
  // /api/mw/admin/users のミドルウェア
  // 親ミドルウェアからFullAdminContextを受け取る
  middleware: async ({ req, next }, parentContext: FullAdminContext) => {
    console.log('Users Middleware (/api/mw/admin/users): Received parent context:', parentContext);

    // このミドルウェアで管理者チェックを行う
    if (!parentContext.isAdmin) {
      console.log('Users Middleware: Forbidden access for non-admin user.');
      // 管理者でなければリクエストをブロック
      return new Response(JSON.stringify({ message: 'Forbidden: Admin access required for users endpoint' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // 管理者の場合は次のハンドラーへ進む (コンテキストは変更しない)
    return next(req); // コンテキストは変更しないのでreqのみ渡す
  },

  // GET /api/mw/admin/users
  // ミドルウェアを通過した場合、親から継承したFullAdminContextを受け取る
  get: async ({ query }, context: FullAdminContext) => {
    console.log('GET Handler (/api/mw/admin/users): Received full context:', context);
    console.log('GET Handler (/api/mw/admin/users): Received query:', query);

    // ここに到達するユーザーは管理者のはず
    const users = ['user1', 'user2', 'admin1'];
    const filteredUsers = query.role ? users.filter(u => u.includes(query.role as string)) : users;

    return { status: 200, body: { context, users: filteredUsers } };
  },
});