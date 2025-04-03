import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as ancestorSpec0 } from '../../frourio';
import { frourioSpec } from './frourio'

export const fc_2ijh4e = (option?: FrourioClientOption) => ({
  $url: $url(option),
  ...methods(option),
});

export const $fc_2ijh4e = (option?: FrourioClientOption) => ({
  $url: {
    post(req: Parameters<ReturnType<typeof $url>['post']>[0]): string {
      const result = $url(option).post(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  async $post(req: Parameters<ReturnType<typeof methods>['$post']>[0]): Promise<z.infer<typeof frourioSpec.post.res[200]['body']>> {
    const result = await methods(option).$post(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

const paramsSchema = z.object({ 'a': ancestorSpec0.param, 'b': z.string(), 'c': z.array(z.string()) });

const $url = (option?: FrourioClientOption) => ({
  post(req: { params: z.infer<typeof paramsSchema> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL ?? ''}/${parsedParams.data.a}/${parsedParams.data.b}/${parsedParams.data.c.join('/')}` };
  },
});

const methods = (option?: FrourioClientOption) => ({
  async $post(req: { params: z.infer<typeof paramsSchema>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec.post.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url(option).post(req);

    if (url.reason) return url;

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'POST',
        ...option?.init,
        ...req.init,
        headers: { ...option?.init?.headers, ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: true, raw: result.res, error: json.error };

        const body = frourioSpec.post.res[200].body.safeParse(json.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
});
