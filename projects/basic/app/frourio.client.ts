import { z } from 'zod';
import { fc_82hx7j } from './(group1)/frourio.client';
import { fc_17lcihw } from './(group2)/frourio.client';
import { fc_knqmrp } from './[a]/frourio.client';
import { frourioSpec } from './frourio'

const $path = {
  get(req: { query: z.infer<typeof frourioSpec.get.query> }) {
    const parsedQuery = frourioSpec.get.query.safeParse(req.query);

    if (!parsedQuery.success) return;

    const searchParams = new URLSearchParams();

    Object.entries(parsedQuery.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    });

    return `?${searchParams.toString()}`;
  },
  post(req: {  }) {
    return ``;
  },
};

export const fc = {
  '(group1)': fc_82hx7j,
  '(group2)': fc_17lcihw,
  '[a]': fc_knqmrp,
  $path,
  async $get(req: { headers: z.infer<typeof frourioSpec.get.headers>, query: z.infer<typeof frourioSpec.get.query>, init?: RequestInit }) {
    const url = $path.get(req);

    if (!url) return;

    const parsedHeaders = frourioSpec.get.headers.safeParse(req.headers);

    if (!parsedHeaders.success) return;

    const res = await fetch(
      url,
      {
        method: 'GET',
        headers: {  ...parsedHeaders.data as HeadersInit },
        ...req.init,
      }
    );
  },
  async $post(req: { body: z.infer<typeof frourioSpec.post.body>, init?: RequestInit }) {
    const url = $path.post(req);

    if (!url) return;

    const parsedBody = frourioSpec.post.body.safeParse(req.body);

    if (!parsedBody.success) return;

    const res = await fetch(
      url,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', },
        body: JSON.stringify(parsedBody.data),
        ...req.init,
      }
    );
  },
};
