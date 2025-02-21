import { createRoute } from './frourio.server';

export const { POST } = createRoute({
  post: async () => {
    return { status: 200, body: { value: 'ok' } };
  },
});
