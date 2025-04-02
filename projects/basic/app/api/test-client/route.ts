import { createRoute } from './frourio.server';

// Define empty handlers matching the methods in frourio.ts
// The actual logic is mocked by MSW in tests.
export const { GET, POST, PATCH } = createRoute({
  get: async () => {
    throw new Error('Handler not implemented');
  },
  post: async () => {
    throw new Error('Handler not implemented');
  },
  patch: async () => {
    throw new Error('Handler not implemented');
  },
});