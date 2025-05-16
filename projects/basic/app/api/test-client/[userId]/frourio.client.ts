import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_1rqfh40 } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  $url: $url_1rqfh40(option),
  ...methods_1rqfh40(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  $url: {
    put(req: Parameters<ReturnType<typeof $url_1rqfh40>['put']>[0]): string {
      const result = $url_1rqfh40(option).put(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
    delete(req: Parameters<ReturnType<typeof $url_1rqfh40>['delete']>[0]): string {
      const result = $url_1rqfh40(option).delete(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  async $put(req: Parameters<ReturnType<typeof methods_1rqfh40>['$put']>[0]): Promise<z.infer<typeof frourioSpec_1rqfh40.put.res[200]['body']>> {
    const result = await methods_1rqfh40(option).$put(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
  async $delete(req: Parameters<ReturnType<typeof methods_1rqfh40>['$delete']>[0]): Promise<void> {
    const result = await methods_1rqfh40(option).$delete(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
});

export const fc_1rqfh40 = fc;

export const $fc_1rqfh40 = $fc;

const paramsSchema_1rqfh40 = z.object({ 'userId': frourioSpec_1rqfh40.param });

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

const methods_1rqfh40 = (option?: FrourioClientOption) => ({
  async $put(req: { params: z.infer<typeof paramsSchema_1rqfh40>, body: z.infer<typeof frourioSpec_1rqfh40.put.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_1rqfh40.put.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 404; headers?: undefined; body: z.infer<typeof frourioSpec_1rqfh40.put.res[404]['body']> }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_1rqfh40(option).put(req);

    if (url.reason) return url;

    const parsedBody = frourioSpec_1rqfh40.put.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, reason: parsedBody.error };

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'PUT',
        ...option?.init,
        body: JSON.stringify(parsedBody.data),
        ...req.init,
        headers: { ...option?.init?.headers, 'content-type': 'application/json', ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_1rqfh40.put.res[200].body.safeParse(resBody.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data },
          raw: result.res,
        };
      }
      case 404: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: false, raw: result.res, error: resBody.error };

        const body = frourioSpec_1rqfh40.put.res[404].body.safeParse(resBody.data);

        if (!body.success) return { ok: false, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: false,
          isValid: true,
          failure: { status: 404, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
  async $delete(req: { params: z.infer<typeof paramsSchema_1rqfh40>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 204; headers?: undefined; body?: undefined }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 404; headers?: undefined; body: z.infer<typeof frourioSpec_1rqfh40.delete.res[404]['body']> }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_1rqfh40(option).delete(req);

    if (url.reason) return url;

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'DELETE',
        ...option?.init,
        ...req.init,
        headers: { ...option?.init?.headers, ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 204: {
        return {
          ok: true,
          isValid: true,
          data: { status: 204 },
          raw: result.res,
        };
      }
      case 404: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: false, raw: result.res, error: resBody.error };

        const body = frourioSpec_1rqfh40.delete.res[404].body.safeParse(resBody.data);

        if (!body.success) return { ok: false, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: false,
          isValid: true,
          failure: { status: 404, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
});

