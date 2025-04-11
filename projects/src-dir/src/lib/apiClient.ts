import { fc } from '../app/api/frourio.client';

export const apiClient = fc({
  init: { headers: { authorization: `Bearer ${process.env.token}` } },
});
