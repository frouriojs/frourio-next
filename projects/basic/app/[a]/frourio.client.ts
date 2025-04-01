import { z } from 'zod';
import { fc_2ijh4e } from './[b]/[...c]/frourio.client';
import { fc_1yzfjrp } from './[b]/d/frourio.client';
import { frourioSpec } from './frourio'

const paramsSchema = z.object({ 'a': frourioSpec.param });

const $path = {
  get(req: { params: z.infer<typeof paramsSchema> }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, error: parsedParams.error };

    return { isValid: true, data: `/${parsedParams.data.a}` };
  },
};

export const fc_knqmrp = {
  '[b]/[...c]': fc_2ijh4e,
  '[b]/d': fc_1yzfjrp,
  $path,
  async $get(req: { params: z.infer<typeof paramsSchema>, init?: RequestInit }): Promise<
    { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec.get.res[200]['body']> }; error?: undefined } |
    { ok: false; isValid: true; data?: undefined; error?: undefined } |
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

    switch (result.res.status) {
      case 200: {
        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: true, data: result.res, error: json.error };

        const body = frourioSpec.get.res[200].body.safeParse(json.data);

        if (!body.success) return { ok: true, data: result.res, error: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data }
        };
      }
      default:
        return { ok: result.res.ok, data: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
};
