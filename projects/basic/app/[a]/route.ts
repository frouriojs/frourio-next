import { createRoute } from './frourio.server';

export const { GET, middleware } = createRoute({
  middleware: async ({ req, next }) => {
    return next(req, { user: { name: 'aaa' } });
  },
  get: async ({ params }, { user }) => {
    return { status: 200, body: { param: params.a, name: user.name } };
  },
});
