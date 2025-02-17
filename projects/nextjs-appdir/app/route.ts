import { createRoute } from './frourio.server';

export const { GET, POST } = createRoute({
  get: async ({ query }) => ({ status: 200, body: { bb: query.aa } }),
  post: async ({ body }) => ({ status: 201, body: [body.bb], headers: { 'Set-Cookie': 'aaa' } }),
});
