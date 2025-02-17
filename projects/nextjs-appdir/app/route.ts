import { createRoute } from './frourio.server';

export const { GET, POST } = createRoute({
  get: async ({ query }) => {
    return { status: 200, body: { bb: query.aa } };
  },
  post: async ({ body }) => {
    return { status: 201, body: [body.bb], headers: { 'Set-Cookie': 'aaa' } };
  },
});
