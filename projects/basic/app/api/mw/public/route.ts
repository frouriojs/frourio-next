import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  get: async () => {
    console.log('GET Handler (/api/mw/public): No middleware context expected.');

    return { status: 200, body: { message: 'This is a public endpoint.' } };
  },
});