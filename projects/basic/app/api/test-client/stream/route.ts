import { createRoute } from './frourio.server';

export const { POST } = createRoute({
  post: async () => {
    throw new Error('Handler not implemented');
  },
});
