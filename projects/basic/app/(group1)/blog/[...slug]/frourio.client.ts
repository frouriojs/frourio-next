import { z } from 'zod';
import { frourioSpec } from './frourio'

const paramsSchema = z.object({ 'slug': frourioSpec.param });

const $path = {
  get(req: { params: z.infer<typeof paramsSchema> }) {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return;

    return `/blog/${parsedParams.data.slug.join('/')}`;
  },
};

export const fc_er79ce = {
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
