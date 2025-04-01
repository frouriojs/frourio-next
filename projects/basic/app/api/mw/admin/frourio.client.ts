import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { fc_gye2fo, $fc_gye2fo } from './users/frourio.client';
import { frourioSpec } from './frourio'

export const fc_n3it2j = (option?: FrourioClientOption) => ({
  'users': fc_gye2fo(option),
  $path: $path(option),
  ...methods(option),
});

export const $fc_n3it2j = (option?: FrourioClientOption) => ({
  'users': $fc_gye2fo(option),
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

    if (!result.ok) throw new Error(`HTTP Error: ${result.data.status}`);

    return result.data.body;
  },
});

const $path = (option?: FrourioClientOption) => ({
  get(req: {  }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL ?? ''}/api/mw/admin` };
  },
  post(req: {  }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    return { isValid: true, data: `${option?.baseURL ?? ''}/api/mw/admin` };
  },
});

const methods = (option?: FrourioClientOption) => ({
  async $get(req: { init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec.get.res[200]['body']> }; error?: undefined }
    | { ok: false; isValid: true; data: { status: 403; headers?: undefined; body: z.infer<typeof frourioSpec.get.res[403]['body']> }; error?: undefined }
    | { ok: boolean; isValid: false; data: Response; error: z.ZodError }
    | { ok: boolean; isValid?: undefined; data: Response; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; error: z.ZodError }
    | { ok?: undefined; isValid?: undefined; data?: undefined; error: unknown }
  > {
    const url = $path(option).get(req);

    if (url.error) return url;

    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetch(
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
      case 403: {
        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: false, data: result.res, error: json.error };

        const body = frourioSpec.get.res[403].body.safeParse(json.data);

        if (!body.success) return { ok: false, data: result.res, error: body.error };

        return {
          ok: false,
          isValid: true,
          data: { status: 403, body: body.data }
        };
      }
      default:
        return { ok: result.res.ok, data: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
  async $post(req: { body: z.infer<typeof frourioSpec.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 201; headers?: undefined; body: z.infer<typeof frourioSpec.post.res[201]['body']> }; error?: undefined }
    | { ok: false; isValid: true; data: { status: 403; headers?: undefined; body: z.infer<typeof frourioSpec.post.res[403]['body']> }; error?: undefined }
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
        ...option?.init,
        body: JSON.stringify(parsedBody.data),
        ...req.init,
        headers: { ...option?.init?.headers, 'content-type': 'application/json', ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 201: {
        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: true, data: result.res, error: json.error };

        const body = frourioSpec.post.res[201].body.safeParse(json.data);

        if (!body.success) return { ok: true, data: result.res, error: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 201, body: body.data }
        };
      }
      case 403: {
        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: false, data: result.res, error: json.error };

        const body = frourioSpec.post.res[403].body.safeParse(json.data);

        if (!body.success) return { ok: false, data: result.res, error: body.error };

        return {
          ok: false,
          isValid: true,
          data: { status: 403, body: body.data }
        };
      }
      default:
        return { ok: result.res.ok, data: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
});
