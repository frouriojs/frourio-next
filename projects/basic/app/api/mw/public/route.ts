import { createRoute } from './frourio.server';

// このルートにはミドルウェアはない
export const { GET } = createRoute({
  // GET /api/mw/public
  // このハンドラーはコンテキストを受け取らない
  get: async () => {
    console.log('GET Handler (/api/mw/public): No middleware context expected.');
    return { status: 200, body: { message: 'This is a public endpoint.' } };
  },
});