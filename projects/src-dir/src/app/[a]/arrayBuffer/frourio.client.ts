import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_og4f3x } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  $url: $url_og4f3x(option),
  ...methods_og4f3x(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  $url: {
    post(req: Parameters<ReturnType<typeof $url_og4f3x>['post']>[0]): string {
      const result = $url_og4f3x(option).post(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  async $post(req: Parameters<ReturnType<typeof methods_og4f3x>['$post']>[0]): Promise<z.infer<typeof frourioSpec_og4f3x.post.res[200]['body']>> {
    const result = await methods_og4f3x(option).$post(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_og4f3x = fc;

export const $fc_og4f3x = $fc;

const paramsSchema_og4f3x = z.object({ 'a': z.string() });

const $url_og4f3x = (option?: FrourioClientOption) => ({
  post(req: { params: z.infer<typeof paramsSchema_og4f3x> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_og4f3x.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/foo/bar/${parsedParams.data.a}/arrayBuffer` };
  },
});

const methods_og4f3x = (option?: FrourioClientOption) => ({
  async $post(req: { params: z.infer<typeof paramsSchema_og4f3x>, body: z.infer<typeof frourioSpec_og4f3x.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_og4f3x.post.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_og4f3x(option).post(req);

    if (url.reason) return url;

    const parsedBody = frourioSpec_og4f3x.post.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, reason: parsedBody.error };

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'POST',
        ...option?.init,
        body: parsedBody.data,
        ...req.init,
        headers: { ...option?.init?.headers, 'content-type': 'application/octet-stream', ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.arrayBuffer().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_og4f3x.post.res[200].body.safeParse(resBody.data);

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

