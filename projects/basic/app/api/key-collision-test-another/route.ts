import { createRoute } from './frourio.server';

export const { GET} = createRoute({
  get: async ({ query }) => {
    return { status: 200, body: { data: `key-collision-test-another: ${query.common}` } };
  },
});