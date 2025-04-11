import { randomUUID } from 'crypto';
import { createRoute } from './frourio.server';

export const { middleware, GET } = createRoute({
  middleware: async ({ req, next }) => {
    const authorization = req.headers.get('Authorization');
    const traceId = req.headers.get('X-Trace-Id') ?? randomUUID();
    const userId = authorization?.startsWith('Bearer user-')
      ? authorization.split(' ')[1]
      : undefined;

    console.log(`Root Middleware (/api/mw): userId=${userId}, traceId=${traceId}`);

    return next({ userId, traceId });
  },
  get: async (req, context) => {
    console.log('GET Handler (/api/mw): Received context:', context);

    return { status: 200, body: context };
  },
});
