import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { fc_rket09, $fc_rket09 } from './(group1)/[pid]/frourio.client';
import { fc_er79ce, $fc_er79ce } from './(group1)/blog/[...slug]/frourio.client';
import { fc_14jcy50, $fc_14jcy50 } from './(group1)/blog/hoge/[[...fuga]]/frourio.client';
import { fc_13e9lnf, $fc_13e9lnf } from './(group2)/x/[y]/frourio.client';
import { fc_knqmrp, $fc_knqmrp } from './[a]/frourio.client';
import { fc_1f8i0zm, $fc_1f8i0zm } from './api/key-collision-test/frourio.client';
import { fc_195l5vw, $fc_195l5vw } from './api/key-collision-test-another/frourio.client';
import { fc_sqrir7, $fc_sqrir7 } from './api/mw/frourio.client';
import { fc_17yqnk1, $fc_17yqnk1 } from './api/test-client/frourio.client';
import { frourioSpec } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  '(group1)/[pid]': fc_rket09(option),
  '(group1)/blog/[...slug]': fc_er79ce(option),
  '(group1)/blog/hoge/[[...fuga]]': fc_14jcy50(option),
  '(group2)/x/[y]': fc_13e9lnf(option),
  '[a]': fc_knqmrp(option),
  'api/key-collision-test': fc_1f8i0zm(option),
  'api/key-collision-test-another': fc_195l5vw(option),
  'api/mw': fc_sqrir7(option),
  'api/test-client': fc_17yqnk1(option),
  $url: $url(option),
  $build(req: Parameters<ReturnType<typeof methods>['$get']>[0] | null): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods>['$get']>>>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/', ...rest }, () => fc(option).$get(req)];
  },
  ...methods(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  '(group1)/[pid]': $fc_rket09(option),
  '(group1)/blog/[...slug]': $fc_er79ce(option),
  '(group1)/blog/hoge/[[...fuga]]': $fc_14jcy50(option),
  '(group2)/x/[y]': $fc_13e9lnf(option),
  '[a]': $fc_knqmrp(option),
  'api/key-collision-test': $fc_1f8i0zm(option),
  'api/key-collision-test-another': $fc_195l5vw(option),
  'api/mw': $fc_sqrir7(option),
  'api/test-client': $fc_17yqnk1(option),
  $url: {
    get(req: Parameters<ReturnType<typeof $url>['get']>[0]): string {
      const result = $url(option).get(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
    post(): string {
      const result = $url(option).post();

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req: Parameters<ReturnType<typeof methods>['$get']>[0] | null): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<z.infer<typeof frourioSpec.get.res[200]['body']>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/', ...rest }, () => $fc(option).$get(req)];
  },
  async $get(req: Parameters<ReturnType<typeof methods>['$get']>[0]): Promise<z.infer<typeof frourioSpec.get.res[200]['body']>> {
    const result = await methods(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
  async $post(req: Parameters<ReturnType<typeof methods>['$post']>[0]): Promise<z.infer<typeof frourioSpec.post.res[201]['body']>> {
    const result = await methods(option).$post(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_ztntfp = fc;

export const $fc_ztntfp = $fc;

const $url = (option?: FrourioClientOption) => ({
  get(req: { query: z.infer<typeof frourioSpec.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedQuery = frourioSpec.get.query.safeParse(req.query);

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

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/?${searchParams.toString()}` };
  },
  post(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/` };
  },
});

const methods = (option?: FrourioClientOption) => ({
  async $get(req: { headers: z.infer<typeof frourioSpec.get.headers>, query: z.infer<typeof frourioSpec.get.query>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 404; headers?: undefined; body?: undefined }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url(option).get(req);

    if (url.reason) return url;

    const parsedHeaders = frourioSpec.get.headers.safeParse(req.headers);

    if (!parsedHeaders.success) return { isValid: false, reason: parsedHeaders.error };

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'GET',
        ...option?.init,
        ...req.init,
        headers: { ...option?.init?.headers, ...parsedHeaders.data as HeadersInit, ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec.get.res[200].body.safeParse(resBody.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data },
          raw: result.res,
        };
      }
      case 404: {
        return {
          ok: false,
          isValid: true,
          failure: { status: 404 },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
  async $post(req: { body: z.infer<typeof frourioSpec.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 201; headers: z.infer<typeof frourioSpec.post.res[201]['headers']>; body: z.infer<typeof frourioSpec.post.res[201]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url(option).post();

    if (url.reason) return url;

    const parsedBody = frourioSpec.post.body.safeParse(req.body);

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

    switch (result.res.status) {
      case 201: {
        const headers = frourioSpec.post.res[201].headers.safeParse(Object.fromEntries(result.res.headers.entries()));

        if (!headers.success) return { ok: true, isValid: false, raw: result.res, reason: headers.error };

        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec.post.res[201].body.safeParse(resBody.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 201, headers: headers.data, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
});
