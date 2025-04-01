import { fc } from "../app/frourio.client";

export const apiClient = fc({
  init: { headers: { authorization: `Bearer ${process.env.token}` }},
});
