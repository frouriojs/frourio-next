import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_rket09 } from './(group1)/[pid]/frourio';
import { fc_rket09, $fc_rket09 } from './(group1)/[pid]/frourio.client';
import { frourioSpec as frourioSpec_1c6qmxu } from './(group1)/[pid]/foo/frourio';
import { fc_1c6qmxu, $fc_1c6qmxu } from './(group1)/[pid]/foo/frourio.client';
import { frourioSpec as frourioSpec_er79ce } from './(group1)/blog/[...slug]/frourio';
import { fc_er79ce, $fc_er79ce } from './(group1)/blog/[...slug]/frourio.client';
import { frourioSpec as frourioSpec_14jcy50 } from './(group1)/blog/hoge/[[...fuga]]/frourio';
import { fc_14jcy50, $fc_14jcy50 } from './(group1)/blog/hoge/[[...fuga]]/frourio.client';
import { frourioSpec as frourioSpec_13e9lnf } from './(group2)/x/[y]/frourio';
import { fc_13e9lnf, $fc_13e9lnf } from './(group2)/x/[y]/frourio.client';
import { frourioSpec as frourioSpec_knqmrp } from './[a]/frourio';
import { fc_knqmrp, $fc_knqmrp } from './[a]/frourio.client';
import { frourioSpec as frourioSpec_2ijh4e } from './[a]/[b]/[...c]/frourio';
import { fc_2ijh4e, $fc_2ijh4e } from './[a]/[b]/[...c]/frourio.client';
import { frourioSpec as frourioSpec_1yzfjrp } from './[a]/[b]/d/frourio';
import { fc_1yzfjrp, $fc_1yzfjrp } from './[a]/[b]/d/frourio.client';
import { frourioSpec as frourioSpec_1f8i0zm } from './api/key-collision-test/frourio';
import { fc_1f8i0zm, $fc_1f8i0zm } from './api/key-collision-test/frourio.client';
import { frourioSpec as frourioSpec_195l5vw } from './api/key-collision-test-another/frourio';
import { fc_195l5vw, $fc_195l5vw } from './api/key-collision-test-another/frourio.client';
import { frourioSpec as frourioSpec_sqrir7 } from './api/mw/frourio';
import { fc_sqrir7, $fc_sqrir7 } from './api/mw/frourio.client';
import { frourioSpec as frourioSpec_n3it2j } from './api/mw/admin/frourio';
import { fc_n3it2j, $fc_n3it2j } from './api/mw/admin/frourio.client';
import { frourioSpec as frourioSpec_gye2fo } from './api/mw/admin/users/frourio';
import { fc_gye2fo, $fc_gye2fo } from './api/mw/admin/users/frourio.client';
import { frourioSpec as frourioSpec_76vmqd } from './api/mw/public/frourio';
import { fc_76vmqd, $fc_76vmqd } from './api/mw/public/frourio.client';
import { frourioSpec as frourioSpec_17yqnk1 } from './api/test-client/frourio';
import { fc_17yqnk1, $fc_17yqnk1 } from './api/test-client/frourio.client';
import { frourioSpec as frourioSpec_1rqfh40 } from './api/test-client/[userId]/frourio';
import { fc_1rqfh40, $fc_1rqfh40 } from './api/test-client/[userId]/frourio.client';
import { frourioSpec as frourioSpec_1tp1ur6 } from './api/test-client/stream/frourio';
import { fc_1tp1ur6, $fc_1tp1ur6 } from './api/test-client/stream/frourio.client';
import { frourioSpec as frourioSpec_ztntfp } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  '(group1)/[pid]': fc_rket09(option),
  '(group1)/[pid]/foo': fc_1c6qmxu(option),
  '(group1)/blog/[...slug]': fc_er79ce(option),
  '(group1)/blog/hoge/[[...fuga]]': fc_14jcy50(option),
  '(group2)/x/[y]': fc_13e9lnf(option),
  '[a]': fc_knqmrp(option),
  '[a]/[b]/[...c]': fc_2ijh4e(option),
  '[a]/[b]/d': fc_1yzfjrp(option),
  'api/key-collision-test': fc_1f8i0zm(option),
  'api/key-collision-test-another': fc_195l5vw(option),
  'api/mw': fc_sqrir7(option),
  'api/mw/admin': fc_n3it2j(option),
  'api/mw/admin/users': fc_gye2fo(option),
  'api/mw/public': fc_76vmqd(option),
  'api/test-client': fc_17yqnk1(option),
  'api/test-client/[userId]': fc_1rqfh40(option),
  'api/test-client/stream': fc_1tp1ur6(option),
  $url: $url_ztntfp(option),
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
  '(group1)/[pid]/foo': $fc_1c6qmxu(option),
  '(group1)/blog/[...slug]': $fc_er79ce(option),
  '(group1)/blog/hoge/[[...fuga]]': $fc_14jcy50(option),
  '(group2)/x/[y]': $fc_13e9lnf(option),
  '[a]': $fc_knqmrp(option),
  '[a]/[b]/[...c]': $fc_2ijh4e(option),
  '[a]/[b]/d': $fc_1yzfjrp(option),
  'api/key-collision-test': $fc_1f8i0zm(option),
  'api/key-collision-test-another': $fc_195l5vw(option),
  'api/mw': $fc_sqrir7(option),
  'api/mw/admin': $fc_n3it2j(option),
  'api/mw/admin/users': $fc_gye2fo(option),
  'api/mw/public': $fc_76vmqd(option),
  'api/test-client': $fc_17yqnk1(option),
  'api/test-client/[userId]': $fc_1rqfh40(option),
  'api/test-client/stream': $fc_1tp1ur6(option),
  $url: {
    get(req: Parameters<ReturnType<typeof $url_ztntfp>['get']>[0]): string {
      const result = $url_ztntfp(option).get(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
    post(): string {
      const result = $url_ztntfp(option).post();

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req: Parameters<ReturnType<typeof methods>['$get']>[0] | null): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<z.infer<typeof frourioSpec_ztntfp.get.res[200]['body']>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/', ...rest }, () => $fc(option).$get(req)];
  },
  async $get(req: Parameters<ReturnType<typeof methods>['$get']>[0]): Promise<z.infer<typeof frourioSpec_ztntfp.get.res[200]['body']>> {
    const result = await methods(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
  async $post(req: Parameters<ReturnType<typeof methods>['$post']>[0]): Promise<z.infer<typeof frourioSpec_ztntfp.post.res[201]['body']>> {
    const result = await methods(option).$post(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_ztntfp = fc;

export const $fc_ztntfp = $fc;

const paramsSchema_rket09 = z.object({ 'pid': z.string() });

const paramsSchema_1c6qmxu = z.object({ 'pid': z.string() });

const paramsSchema_er79ce = z.object({ 'slug': frourioSpec_er79ce.param });

const paramsSchema_14jcy50 = z.object({ 'fuga': frourioSpec_14jcy50.param });

const paramsSchema_13e9lnf = z.object({ 'y': z.string() });

const paramsSchema_knqmrp = z.object({ 'a': frourioSpec_knqmrp.param });

const paramsSchema_2ijh4e = z.object({ 'a': frourioSpec_knqmrp.param, 'b': z.string(), 'c': z.array(z.string()) });

const paramsSchema_1yzfjrp = z.object({ 'a': frourioSpec_knqmrp.param, 'b': z.string() });

const paramsSchema_1rqfh40 = z.object({ 'userId': frourioSpec_1rqfh40.param });

const $url_ztntfp = (option?: FrourioClientOption) => ({
  get(req: { query: z.infer<typeof frourioSpec_ztntfp.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedQuery = frourioSpec_ztntfp.get.query.safeParse(req.query);

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

const $url_rket09 = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_rket09>,query: z.infer<typeof frourioSpec_rket09.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_rket09.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    const parsedQuery = frourioSpec_rket09.get.query.safeParse(req.query);

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

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/${parsedParams.data.pid}?${searchParams.toString()}` };
  },
});

const $url_1c6qmxu = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_1c6qmxu> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_1c6qmxu.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/${parsedParams.data.pid}/foo` };
  },
});

const $url_er79ce = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_er79ce> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_er79ce.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/blog/${parsedParams.data.slug.join('/')}` };
  },
});

const $url_14jcy50 = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_14jcy50> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_14jcy50.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/blog/hoge${parsedParams.data.fuga !== undefined && parsedParams.data.fuga.length > 0 ? `/${parsedParams.data.fuga.join('/')}` : ''}` };
  },
});

const $url_13e9lnf = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_13e9lnf>,query: z.infer<typeof frourioSpec_13e9lnf.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_13e9lnf.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    const parsedQuery = frourioSpec_13e9lnf.get.query.safeParse(req.query);

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

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/x/${parsedParams.data.y}?${searchParams.toString()}` };
  },
});

const $url_knqmrp = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_knqmrp> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_knqmrp.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/${parsedParams.data.a}` };
  },
});

const $url_2ijh4e = (option?: FrourioClientOption) => ({
  post(req: { params: z.infer<typeof paramsSchema_2ijh4e> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_2ijh4e.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/${parsedParams.data.a}/${parsedParams.data.b}/${parsedParams.data.c.join('/')}` };
  },
});

const $url_1yzfjrp = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema_1yzfjrp> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_1yzfjrp.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/${parsedParams.data.a}/${parsedParams.data.b}/d` };
  },
});

const $url_1f8i0zm = (option?: FrourioClientOption) => ({
  get(req: { query: z.infer<typeof frourioSpec_1f8i0zm.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedQuery = frourioSpec_1f8i0zm.get.query.safeParse(req.query);

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

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/key-collision-test?${searchParams.toString()}` };
  },
});

const $url_195l5vw = (option?: FrourioClientOption) => ({
  get(req: { query: z.infer<typeof frourioSpec_195l5vw.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedQuery = frourioSpec_195l5vw.get.query.safeParse(req.query);

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

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/key-collision-test-another?${searchParams.toString()}` };
  },
});

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

const $url_17yqnk1 = (option?: FrourioClientOption) => ({
  get(req: { query: z.infer<typeof frourioSpec_17yqnk1.get.query> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedQuery = frourioSpec_17yqnk1.get.query.safeParse(req.query);

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

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/test-client?${searchParams.toString()}` };
  },
  post(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/test-client` };
  },
  patch(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/test-client` };
  },
});

const $url_1rqfh40 = (option?: FrourioClientOption) => ({
  put(req: { params: z.infer<typeof paramsSchema_1rqfh40> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_1rqfh40.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/test-client/${parsedParams.data.userId}` };
  },
  delete(req: { params: z.infer<typeof paramsSchema_1rqfh40> }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    const parsedParams = paramsSchema_1rqfh40.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };

    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/test-client/${parsedParams.data.userId}` };
  },
});

const $url_1tp1ur6 = (option?: FrourioClientOption) => ({
  post(): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL?.replace(/\/$/, '') ?? ''}/api/test-client/stream` };
  },
});

const methods = (option?: FrourioClientOption) => ({
  async $get(req: { headers: z.infer<typeof frourioSpec_ztntfp.get.headers>, query: z.infer<typeof frourioSpec_ztntfp.get.query>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_ztntfp.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 404; headers?: undefined; body?: undefined }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_ztntfp(option).get(req);

    if (url.reason) return url;

    const parsedHeaders = frourioSpec_ztntfp.get.headers.safeParse(req.headers);

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

        const body = frourioSpec_ztntfp.get.res[200].body.safeParse(resBody.data);

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
  async $post(req: { body: z.infer<typeof frourioSpec_ztntfp.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 201; headers: z.infer<typeof frourioSpec_ztntfp.post.res[201]['headers']>; body: z.infer<typeof frourioSpec_ztntfp.post.res[201]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_ztntfp(option).post();

    if (url.reason) return url;

    const parsedBody = frourioSpec_ztntfp.post.body.safeParse(req.body);

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
        const headers = frourioSpec_ztntfp.post.res[201].headers.safeParse(Object.fromEntries(result.res.headers.entries()));

        if (!headers.success) return { ok: true, isValid: false, raw: result.res, reason: headers.error };

        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_ztntfp.post.res[201].body.safeParse(resBody.data);

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
