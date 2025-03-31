import { z } from 'zod';
import { frourioSpec } from './frourio'

const paramsSchema = z.object({ 'pid': z.string() });

const $path = {
  get(req: { params: z.infer<typeof paramsSchema>,query: z.infer<typeof frourioSpec.get.query> }) {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return;

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

    return `/${parsedParams.data.pid}?${searchParams.toString()}`;
  },
};

export const fc = {
  async $get(req: { params: z.infer<typeof paramsSchema>, query: z.infer<typeof frourioSpec.get.query>, init?: RequestInit }) {
    const url = $path.get(req);

    if (!url) return;

    const res = await fetch(
      url,
      {
        method: 'GET',
        ...req.init,
      }
    );
  },
  $path,
};
