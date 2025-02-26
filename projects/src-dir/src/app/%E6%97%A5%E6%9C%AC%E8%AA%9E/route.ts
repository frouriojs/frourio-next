import { createRoute } from './frourio.server';

export const { POST } = createRoute({
  post: async ({ body }) => {
    return { status: 200, body };
  },
});
