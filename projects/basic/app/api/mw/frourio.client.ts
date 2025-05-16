import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_n3it2j } from './admin/frourio';
import { fc_n3it2j, $fc_n3it2j } from './admin/frourio.client';
import { frourioSpec as frourioSpec_gye2fo } from './admin/users/frourio';
import { fc_gye2fo, $fc_gye2fo } from './admin/users/frourio.client';
import { frourioSpec as frourioSpec_76vmqd } from './public/frourio';
import { fc_76vmqd, $fc_76vmqd } from './public/frourio.client';
import { frourioSpec as frourioSpec_sqrir7 } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  'admin': fc_n3it2j(option),
  'admin/users': fc_gye2fo(option),
  'public': fc_76vmqd(option),
  $url: $url_sqrir7(option),
  $build(req?: { init?: RequestInit }): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string },
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods>['$get']>>>>,
  ] {
    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/api/mw' }, () => fc(option).$get(req)];
  },
  ...methods(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  'admin': $fc_n3it2j(option),
  'admin/users': $fc_gye2fo(option),
  'public': $fc_76vmqd(option),
  $url: {
    get(): string {
      const result = $url_sqrir7(option).get();

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req?: { init?: RequestInit }): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string },
    fetcher: () => Promise<z.infer<typeof frourioSpec_sqrir7.get.res[200]['body']>>,
  ] {
    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/api/mw' }, () => $fc(option).$get(req)];
  },
  async $get(req?: Parameters<ReturnType<typeof methods>['$get']>[0]): Promise<z.infer<typeof frourioSpec_sqrir7.get.res[200]['body']>> {
    const result = await methods(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_sqrir7 = fc;

export const $fc_sqrir7 = $fc;

const $url_sqrir7 = (option?: FrourioClientOption) => ({
  get(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/mw` };
  },
});

const $url_n3it2j = (option?: FrourioClientOption) => ({
  get(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/mw/admin` };
  },
  post(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/mw/admin` };
  },
});

const $url_gye2fo = (option?: FrourioClientOption) => ({
  get(req: { query: z.infer<typeof frourioSpec_gye2fo.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedQuery = frourioSpec_gye2fo.get.query.safeParse(req.query);

    if (!parsedQuery.success) return { isValid: false, reason: parsedQuery.error };

    const searchParams = new URLSearchParams();

    Object.entries(parsedQuery.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    });

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/mw/admin/users?${searchParams.toString()}` };
  },
});

const $url_76vmqd = (option?: FrourioClientOption) => ({
  get(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/mw/public` };
  },
});

const methods = (option?: FrourioClientOption) => ({
  async $get(req?: { init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_sqrir7.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_sqrir7(option).get();

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

        const body = frourioSpec_sqrir7.get.res[200].body.safeParse(resBody.data);

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
