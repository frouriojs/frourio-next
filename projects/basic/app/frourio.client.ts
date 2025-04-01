import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { fc_82hx7j, $fc_82hx7j } from './(group1)/frourio.client';
import { fc_17lcihw, $fc_17lcihw } from './(group2)/frourio.client';
import { fc_knqmrp, $fc_knqmrp } from './[a]/frourio.client';
import { frourioSpec } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  '(group1)': fc_82hx7j(option),
  '(group2)': fc_17lcihw(option),
  '[a]': fc_knqmrp(option),
  $path: $path(option),
  ...methods(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  '(group1)': $fc_82hx7j(option),
  '(group2)': $fc_17lcihw(option),
  '[a]': $fc_knqmrp(option),
  $path: {
    get(req: Parameters<ReturnType<typeof $path>['get']>[0]): string {
      const result = $path(option).get(req);

      if (!result.isValid) throw result.error;

      return result.data;
    },
    post(req: Parameters<ReturnType<typeof $path>['post']>[0]): string {
      const result = $path(option).post(req);

      if (!result.isValid) throw result.error;

      return result.data;
    },
  },
  async $get(req: Parameters<ReturnType<typeof methods>['$get']>[0]): Promise<z.infer<typeof frourioSpec.get.res[200]['body']>> {
    const result = await methods(option).$get(req);

    if (!result.isValid) throw result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.data.status}`);

    return result.data.body;
  },
  async $post(req: Parameters<ReturnType<typeof methods>['$post']>[0]): Promise<z.infer<typeof frourioSpec.post.res[201]['body']>> {
    const result = await methods(option).$post(req);

    if (!result.isValid) throw result.error;

    return result.data.body;
  },
});

const $path = (option?: FrourioClientOption) => ({
  get(req: { query: z.infer<typeof frourioSpec.get.query> }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    const parsedQuery = frourioSpec.get.query.safeParse(req.query);

    if (!parsedQuery.success) return { isValid: false, error: parsedQuery.error };

    const searchParams = new URLSearchParams();

    Object.entries(parsedQuery.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    });

    return { isValid: true, data: `${option?.baseURL ?? ''}/?${searchParams.toString()}` };
  },
  post(req: {  }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL ?? ''}/` };
  },
});

const methods = (option?: FrourioClientOption) => ({
  async $get(req: { headers: z.infer<typeof frourioSpec.get.headers>, query: z.infer<typeof frourioSpec.get.query>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec.get.res[200]['body']> }; error?: undefined }
    | { ok: false; isValid: true; data: { status: 404; headers?: undefined; body?: undefined }; error?: undefined }
    | { ok: boolean; isValid: false; data: Response; error: z.ZodError }
    | { ok: boolean; isValid?: undefined; data: Response; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; error: z.ZodError }
    | { ok?: undefined; isValid?: undefined; data?: undefined; error: unknown }
  > {
    const url = $path(option).get(req);

    if (url.error) return url;

    const parsedHeaders = frourioSpec.get.headers.safeParse(req.headers);

    if (!parsedHeaders.success) return { isValid: false, error: parsedHeaders.error };

    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetch(
      url.data,
      {
        method: 'GET',
        ...req.init,
        headers: { ...parsedHeaders.data as HeadersInit, ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: true, data: result.res, error: json.error };

        const body = frourioSpec.get.res[200].body.safeParse(json.data);

        if (!body.success) return { ok: true, data: result.res, error: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data }
        };
      }
      case 404: {
        return {
          ok: false,
          isValid: true,
          data: { status: 404 }
        };
      }
      default:
        return { ok: result.res.ok, data: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
  async $post(req: { body: z.infer<typeof frourioSpec.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 201; headers: z.infer<typeof frourioSpec.post.res[201]['headers']>; body: z.infer<typeof frourioSpec.post.res[201]['body']> }; error?: undefined }
    | { ok: boolean; isValid: false; data: Response; error: z.ZodError }
    | { ok: boolean; isValid?: undefined; data: Response; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; error: z.ZodError }
    | { ok?: undefined; isValid?: undefined; data?: undefined; error: unknown }
  > {
    const url = $path(option).post(req);

    if (url.error) return url;

    const parsedBody = frourioSpec.post.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, error: parsedBody.error };

    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetch(
      url.data,
      {
        method: 'POST',
        body: JSON.stringify(parsedBody.data),
        ...req.init,
        headers: { 'content-type': 'application/json', ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 201: {
        const headers = frourioSpec.post.res[201].headers.safeParse(result.res.headers);

        if (!headers.success) return { ok: true, data: result.res, error: headers.error };

        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: true, data: result.res, error: json.error };

        const body = frourioSpec.post.res[201].body.safeParse(json.data);

        if (!body.success) return { ok: true, data: result.res, error: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 201, headers: headers.data, body: body.data }
        };
      }
      default:
        return { ok: result.res.ok, data: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
});
