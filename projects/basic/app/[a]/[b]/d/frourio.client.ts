import { z } from 'zod';
import { frourioSpec as ancestorSpec0 } from '../../frourio';
import { frourioSpec } from './frourio'

const paramsSchema = z.object({ 'a': ancestorSpec0.param, 'b': z.string() });

const $path = {
  get(req: { params: z.infer<typeof paramsSchema> }) {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return;

    return `/${parsedParams.data.a}/${parsedParams.data.b}/d`;
  },
};

export const fc_1yzfjrp = {
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
