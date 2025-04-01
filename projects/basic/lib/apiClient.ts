import { $fc } from "../app/frourio.client";

export const apiClient = $fc({
  baseURL: 'http://example.com',
  init: { credentials: 'include' },
});
