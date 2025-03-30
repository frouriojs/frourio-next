import { createRoute } from './frourio.server';

export const { middleware } = createRoute({
  middleware: async ({ req, next }) => {
    return next(req, { user: { name: 'bbbb' } });
  },
});
