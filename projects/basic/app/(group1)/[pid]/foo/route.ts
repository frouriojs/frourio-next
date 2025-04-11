import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  get: async () => {
    return {
      status: 200,
      body: { value: 'ok' },
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    };
  },
});
