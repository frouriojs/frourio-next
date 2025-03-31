import { z } from 'zod';
import { frourioSpec as ancestorSpec0 } from '../../frourio';
import { frourioSpec } from './frourio'

const paramsSchema = z.object({ 'a': ancestorSpec0.param, 'b': z.string(), 'c': z.array(z.string()) });

const $path = {
  post(req: { params: z.infer<typeof paramsSchema> }) {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return;

    return `/${parsedParams.data.a}/${parsedParams.data.b}/${parsedParams.data.c.join('/')}`;
  },
};

export const fc_2ijh4e = {
  $path,
  async $post(req: { params: z.infer<typeof paramsSchema>, init?: RequestInit }) {
    const url = $path.post(req);

    if (!url) return;

    const res = await fetch(
      url,
      {
        method: 'POST',
        ...req.init,
      }
    );
  },
};
