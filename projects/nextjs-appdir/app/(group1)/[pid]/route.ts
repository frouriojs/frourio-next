import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  get: async ({ params, query }) => {
    return { status: 200, body: { pid: params.pid, query } };
  },
});
