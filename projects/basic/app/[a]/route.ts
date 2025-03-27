import { createRoute } from './frourio.server';

export const { GET, middleware } = createRoute({
  middleware: async (req, ctx, next) => {
    return next(req, { ...ctx, user: { name: 'aaa' } });
  },
  get: async ({ params }) => {
    return { status: 200, body: params.a };
  },
});
