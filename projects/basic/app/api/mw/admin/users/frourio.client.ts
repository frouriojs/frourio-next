import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_gye2fo } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  $url: $url_gye2fo(option),
  $build(req?: Parameters<ReturnType<typeof methods_gye2fo>['$get']>[0] | null): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_gye2fo>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods_gye2fo>['$get']>>>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req ?? {};

    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/api/mw/admin/users', ...rest }, () => methods_gye2fo(option).$get(req)];
  },
  ...methods_gye2fo(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  $url: {
    get(req?: Parameters<ReturnType<typeof $url_gye2fo>['get']>[0]): string {
      const result = $url_gye2fo(option).get(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req?: Parameters<ReturnType<typeof methods_gye2fo>['$get']>[0] | null): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_gye2fo>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<z.infer<typeof frourioSpec_gye2fo.get.res[200]['body']>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req ?? {};

    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/api/mw/admin/users', ...rest }, () => $fc(option).$get(req)];
  },
  async $get(req: Parameters<ReturnType<typeof methods_gye2fo>['$get']>[0]): Promise<z.infer<typeof frourioSpec_gye2fo.get.res[200]['body']>> {
    const result = await methods_gye2fo(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
});

export const fc_gye2fo = fc;

export const $fc_gye2fo = $fc;

const $url_gye2fo = (option?: FrourioClientOption) => ({
  get(req?: { query?: z.infer<typeof frourioSpec_gye2fo.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedQuery = frourioSpec_gye2fo.get.query.safeParse(req?.query);

    if (!parsedQuery.success) return { isValid: false, reason: parsedQuery.error };

    let searchParams: URLSearchParams | undefined = undefined;

    if (parsedQuery.data !== undefined) {
      const sp = new URLSearchParams();

      Object.entries(parsedQuery.data).forEach(([key, value]) => {
        if (value === undefined) return;

        if (Array.isArray(value)) {
          value.forEach(item => sp.append(key, item.toString()));
        } else {
          sp.append(key, value.toString());
        }
      });

      searchParams = sp;
    }

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/mw/admin/users${searchParams ? `?${searchParams.toString()}`: ''}` };
  },
});

const methods_gye2fo = (option?: FrourioClientOption) => ({
  async $get(req?: { query?: z.infer<typeof frourioSpec_gye2fo.get.query>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_gye2fo.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 403; headers?: undefined; body: z.infer<typeof frourioSpec_gye2fo.get.res[403]['body']> }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_gye2fo(option).get(req);

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

        const body = frourioSpec_gye2fo.get.res[200].body.safeParse(resBody.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data },
          raw: result.res,
        };
      }
      case 403: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: false, raw: result.res, error: resBody.error };

        const body = frourioSpec_gye2fo.get.res[403].body.safeParse(resBody.data);

        if (!body.success) return { ok: false, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: false,
          isValid: true,
          failure: { status: 403, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
});

