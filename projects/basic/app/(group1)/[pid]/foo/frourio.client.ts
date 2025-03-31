import { z } from 'zod';
import { frourioSpec } from './frourio'

const paramsSchema = z.object({ 'pid': z.string() });

const $path = {
  get(req: { params: z.infer<typeof paramsSchema> }) {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return;

    return `/${parsedParams.data.pid}/foo`;
  },
};

export const fc_1c6qmxu = {
  $path,
  async $get(req: { params: z.infer<typeof paramsSchema>, init?: RequestInit }) {
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
};
