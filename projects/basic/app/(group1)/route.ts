import { createRoute } from './frourio.server';

export const { middleware } = createRoute({
  middleware: async ({ next }) => {
    return next({ user: { name: 'bbbb' } });
  },
});
