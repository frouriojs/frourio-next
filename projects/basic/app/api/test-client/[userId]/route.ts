import { createRoute } from './frourio.server';

// Define empty handlers matching the methods in frourio.ts
// The actual logic is mocked by MSW in tests.
export const { PUT, DELETE } = createRoute({
  put: async () => {
    throw new Error('Handler not implemented');
  },
  delete: async () => {
    throw new Error('Handler not implemented');
  },
});