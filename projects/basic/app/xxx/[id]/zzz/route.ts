import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  async get() {
    return { status: 200, body: 'aaa' };
  },
});
