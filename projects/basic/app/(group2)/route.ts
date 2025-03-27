import { createRoute } from './frourio.server';

export const { middleware } = createRoute({
  middleware: async (req, _ctx, next) => {
    return next(req);
  },
});
