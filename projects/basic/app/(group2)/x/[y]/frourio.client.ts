import { z } from 'zod';
import { frourioSpec } from './frourio'

const paramsSchema = z.object({ 'y': z.string() });

const $path = {
  get(req: { params: z.infer<typeof paramsSchema>,query: z.infer<typeof frourioSpec.get.query> }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, error: parsedParams.error };

    const parsedQuery = frourioSpec.get.query.safeParse(req.query);

    if (!parsedQuery.success) return { isValid: false, error: parsedQuery.error };

    const searchParams = new URLSearchParams();

    Object.entries(parsedQuery.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    });

    return { isValid: true, data: `/x/${parsedParams.data.y}?${searchParams.toString()}` };
  },
};

export const fc_13e9lnf = {
  $path,
  async $get(req: { params: z.infer<typeof paramsSchema>, query: z.infer<typeof frourioSpec.get.query>, init?: RequestInit }): Promise<
    { ok: boolean; isValid: true; data: Response; error?: undefined } |
    { ok: boolean; isValid: false; data: Response; error: z.ZodError } |
    { ok: boolean; isValid?: undefined; data: Response; error: unknown } |
    { ok?: undefined; isValid: false; data?: undefined; error: z.ZodError } |
    { ok?: undefined; isValid?: undefined; data?: undefined; error: unknown }
  > {
    const url = $path.get(req);

    if (url.error) return url;

    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetch(
      url.data,
      {
        method: 'GET',
        ...req.init,
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    return { ok: result.res.ok, isValid: true, data: result.res };
  },
};
