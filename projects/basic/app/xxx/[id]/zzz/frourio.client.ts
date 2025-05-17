import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_8uo3t8 } from '../frourio';
import { frourioSpec as frourioSpec_fkgw0p } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  $url: $url_fkgw0p(option),
  $build(req: Parameters<ReturnType<typeof methods_fkgw0p>['$get']>[0] | null): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_fkgw0p>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods_fkgw0p>['$get']>>>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/xxx/[id]/zzz', ...rest }, () => methods_fkgw0p(option).$get(req)];
  },
  ...methods_fkgw0p(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  $url: {
    get(req: Parameters<ReturnType<typeof $url_fkgw0p>['get']>[0]): string {
      const result = $url_fkgw0p(option).get(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req: Parameters<ReturnType<typeof methods_fkgw0p>['$get']>[0] | null): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_fkgw0p>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<z.infer<typeof frourioSpec_fkgw0p.get.res[200]['body']>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/xxx/[id]/zzz', ...rest }, () => $fc(option).$get(req)];
  },
  async $get(req: Parameters<ReturnType<typeof methods_fkgw0p>['$get']>[0]): Promise<z.infer<typeof frourioSpec_fkgw0p.get.res[200]['body']>> {
    const result = await methods_fkgw0p(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_fkgw0p = fc;

export const $fc_fkgw0p = $fc;

const paramsSchema_fkgw0p = z.object({ 'id': frourioSpec_8uo3t8.param });

const $url_fkgw0p = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_fkgw0p> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_fkgw0p.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/xxx/${parsedParams.data.id}/zzz` };
  },
});

const methods_fkgw0p = (option?: FrourioClientOption) => ({
  async $get(req: { params: z.infer<typeof paramsSchema_fkgw0p>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_fkgw0p.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_fkgw0p(option).get(req);

    if (url.reason) return url;

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'GET',
        ...option?.init,
        ...req.init,
        headers: { ...option?.init?.headers, ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.text().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_fkgw0p.get.res[200].body.safeParse(resBody.data);

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

