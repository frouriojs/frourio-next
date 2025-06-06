import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_76vmqd } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  $url: $url_76vmqd(option),
  $build(req?: { init?: RequestInit }): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string },
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods_76vmqd>['$get']>>>>,
  ] {
    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/api/mw/public' }, () => methods_76vmqd(option).$get(req)];
  },
  ...methods_76vmqd(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  $url: {
    get(): string {
      const result = $url_76vmqd(option).get();

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req?: { init?: RequestInit }): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string },
    fetcher: () => Promise<z.infer<typeof frourioSpec_76vmqd.get.res[200]['body']>>,
  ] {
    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/api/mw/public' }, () => $fc(option).$get(req)];
  },
  async $get(req?: Parameters<ReturnType<typeof methods_76vmqd>['$get']>[0]): Promise<z.infer<typeof frourioSpec_76vmqd.get.res[200]['body']>> {
    const result = await methods_76vmqd(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_76vmqd = fc;

export const $fc_76vmqd = $fc;

const $url_76vmqd = (option?: FrourioClientOption) => ({
  get(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/mw/public` };
  },
});

const methods_76vmqd = (option?: FrourioClientOption) => ({
  async $get(req?: { init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_76vmqd.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_76vmqd(option).get();

    if (url.reason) return url;

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'GET',
        ...option?.init,
        ...req?.init,
        headers: { ...option?.init?.headers, ...req?.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_76vmqd.get.res[200].body.safeParse(resBody.data);

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

