import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_bfn325 } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  $url: $url_bfn325(option),
  ...methods_bfn325(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  $url: {
    post(req: Parameters<ReturnType<typeof $url_bfn325>['post']>[0]): string {
      const result = $url_bfn325(option).post(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  async $post(req: Parameters<ReturnType<typeof methods_bfn325>['$post']>[0]): Promise<z.infer<typeof frourioSpec_bfn325.post.res[200]['body']>> {
    const result = await methods_bfn325(option).$post(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_bfn325 = fc;

export const $fc_bfn325 = $fc;

const paramsSchema_bfn325 = z.object({ 'a': z.string() });

const $url_bfn325 = (option?: FrourioClientOption) => ({
  post(req: { params: z.infer<typeof paramsSchema_bfn325> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_bfn325.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/foo/bar/${parsedParams.data.a}/text` };
  },
});

const methods_bfn325 = (option?: FrourioClientOption) => ({
  async $post(req: { params: z.infer<typeof paramsSchema_bfn325>, body: z.infer<typeof frourioSpec_bfn325.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_bfn325.post.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_bfn325(option).post(req);

    if (url.reason) return url;

    const parsedBody = frourioSpec_bfn325.post.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, reason: parsedBody.error };

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'POST',
        ...option?.init,
        body: parsedBody.data,
        ...req.init,
        headers: { ...option?.init?.headers, 'content-type': 'text/plain', ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.text().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_bfn325.post.res[200].body.safeParse(resBody.data);

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

