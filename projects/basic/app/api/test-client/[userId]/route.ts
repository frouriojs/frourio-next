import { createRoute } from './frourio.server';

export const { PUT, DELETE } = createRoute({
  put: async () => {
    throw new Error('Handler not implemented');
  },
  delete: async () => {
    throw new Error('Handler not implemented');
  },
});
