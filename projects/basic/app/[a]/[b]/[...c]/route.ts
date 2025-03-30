import { createRoute } from './frourio.server';

export const { POST, middleware } = createRoute({
  middleware: async ({ req, next }) => {
    return next(req, { token: 'bbb' });
  },
  post: async ({ params }) => {
    return { status: 200, body: { value: [params.a, params.b, ...params.c] } };
  },
});
