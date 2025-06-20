import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_2ijh4e } from './[b]/[...c]/frourio';
import { frourioSpec as frourioSpec_1yzfjrp } from './[b]/d/frourio';
import { frourioSpec as frourioSpec_knqmrp } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  '[b]/[...c]': {
    $url: $url_2ijh4e(option),
    ...methods_2ijh4e(option),
  },
  '[b]/d': {
    $url: $url_1yzfjrp(option),
    $build(req: Parameters<ReturnType<typeof methods_1yzfjrp>['$get']>[0] | null): [
      key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_1yzfjrp>['$get']>[0], 'init'> | null,
      fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods_1yzfjrp>['$get']>>>>,
    ] {
      if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

      const { init, ...rest } = req;

      return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/[a]/[b]/d', ...rest }, () => methods_1yzfjrp(option).$get(req)];
    },
    ...methods_1yzfjrp(option),
  },
  $url: $url_knqmrp(option),
  $build(req: Parameters<ReturnType<typeof methods_knqmrp>['$get']>[0] | null): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_knqmrp>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods_knqmrp>['$get']>>>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/[a]', ...rest }, () => methods_knqmrp(option).$get(req)];
  },
  ...methods_knqmrp(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  '[b]/[...c]': {
    $url: {
      post(req: Parameters<ReturnType<typeof $url_2ijh4e>['post']>[0]): string {
        const result = $url_2ijh4e(option).post(req);

        if (!result.isValid) throw result.reason;

        return result.data;
      },
    },
    async $post(req: Parameters<ReturnType<typeof methods_2ijh4e>['$post']>[0]): Promise<z.infer<typeof frourioSpec_2ijh4e.post.res[200]['body']>> {
      const result = await methods_2ijh4e(option).$post(req);

      if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

      return result.data.body;
    },
  },
  '[b]/d': {
    $url: {
      get(req: Parameters<ReturnType<typeof $url_1yzfjrp>['get']>[0]): string {
        const result = $url_1yzfjrp(option).get(req);

        if (!result.isValid) throw result.reason;

        return result.data;
      },
    },
    $build(req: Parameters<ReturnType<typeof methods_1yzfjrp>['$get']>[0] | null): [
      key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_1yzfjrp>['$get']>[0], 'init'> | null,
      fetcher: () => Promise<z.infer<typeof frourioSpec_1yzfjrp.get.res[200]['body']>>,
    ] {
      if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

      const { init, ...rest } = req;

      return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/[a]/[b]/d', ...rest }, () => $fc(option)['[b]/d'].$get(req)];
    },
    async $get(req: Parameters<ReturnType<typeof methods_1yzfjrp>['$get']>[0]): Promise<z.infer<typeof frourioSpec_1yzfjrp.get.res[200]['body']>> {
      const result = await methods_1yzfjrp(option).$get(req);

      if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

      return result.data.body;
    },
  },
  $url: {
    get(req: Parameters<ReturnType<typeof $url_knqmrp>['get']>[0]): string {
      const result = $url_knqmrp(option).get(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req: Parameters<ReturnType<typeof methods_knqmrp>['$get']>[0] | null): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_knqmrp>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<z.infer<typeof frourioSpec_knqmrp.get.res[200]['body']>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/[a]', ...rest }, () => $fc(option).$get(req)];
  },
  async $get(req: Parameters<ReturnType<typeof methods_knqmrp>['$get']>[0]): Promise<z.infer<typeof frourioSpec_knqmrp.get.res[200]['body']>> {
    const result = await methods_knqmrp(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    return result.data.body;
  },
});

export const fc_knqmrp = fc;

export const $fc_knqmrp = $fc;

const paramsSchema_knqmrp = z.object({ 'a': frourioSpec_knqmrp.param });

const paramsSchema_2ijh4e = z.object({ 'a': frourioSpec_knqmrp.param, 'b': z.string(), 'c': z.tuple([z.string()]).rest(z.string()) });

const paramsSchema_1yzfjrp = z.object({ 'a': frourioSpec_knqmrp.param, 'b': z.string() });

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

const methods_knqmrp = (option?: FrourioClientOption) => ({
  async $get(req: { params: z.infer<typeof paramsSchema_knqmrp>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_knqmrp.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_knqmrp(option).get(req);

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
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_knqmrp.get.res[200].body.safeParse(resBody.data);

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

const methods_2ijh4e = (option?: FrourioClientOption) => ({
  async $post(req: { params: z.infer<typeof paramsSchema_2ijh4e>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_2ijh4e.post.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_2ijh4e(option).post(req);

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
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_2ijh4e.post.res[200].body.safeParse(resBody.data);

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

const methods_1yzfjrp = (option?: FrourioClientOption) => ({
  async $get(req: { params: z.infer<typeof paramsSchema_1yzfjrp>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_1yzfjrp.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_1yzfjrp(option).get(req);

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
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_1yzfjrp.get.res[200].body.safeParse(resBody.data);

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

