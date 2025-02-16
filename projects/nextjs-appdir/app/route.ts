import { createRoute } from './frourio.server';

export const { GET, POST } = createRoute({
  get: async () => ({ status: 200, body: 'ok' }),
  post: async ({ body }) => ({ status: 200, body: { cc: body.bb } }),
});
