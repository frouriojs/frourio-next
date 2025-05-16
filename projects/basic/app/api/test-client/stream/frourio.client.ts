import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_1tp1ur6 } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  $url: $url_1tp1ur6(option),
  ...methods_1tp1ur6(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  $url: {
    post(): string {
      const result = $url_1tp1ur6(option).post();

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  async $post(req: Parameters<ReturnType<typeof methods_1tp1ur6>['$post']>[0]): Promise<Response> {
    const result = await methods_1tp1ur6(option).$post(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data;
  },
});

export const fc_1tp1ur6 = fc;

export const $fc_1tp1ur6 = $fc;

const $url_1tp1ur6 = (option?: FrourioClientOption) => ({
  post(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/test-client/stream` };
  },
});

const methods_1tp1ur6 = (option?: FrourioClientOption) => ({
  async $post(req: { body: z.infer<typeof frourioSpec_1tp1ur6.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: Response; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: Response; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_1tp1ur6(option).post();

    if (url.reason) return url;

    const parsedBody = frourioSpec_1tp1ur6.post.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, reason: parsedBody.error };

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'POST',
        ...option?.init,
        body: JSON.stringify(parsedBody.data),
        ...req.init,
        headers: { ...option?.init?.headers, 'content-type': 'application/json', ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    return result.res.ok ? { ok: true, isValid: true, data: result.res, raw: result.res } : { ok: false, isValid: true, failure: result.res, raw: result.res };
  },
});

