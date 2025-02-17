import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  get: async ({ params }) => {
    return { status: 200, body: params.slug[0] };
  },
});
