import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  get: async ({ params }) => {
    return { status: 200, body: { value: [params.a, params.b] } };
  },
});
