import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec as frourioSpec_1rqfh40 } from './[userId]/frourio';
import { frourioSpec as frourioSpec_1tp1ur6 } from './stream/frourio';
import { frourioSpec as frourioSpec_17yqnk1 } from './frourio'

export const fc = (option?: FrourioClientOption) => ({
  '[userId]': {
    $url: $url_1rqfh40(option),
    ...methods_1rqfh40(option),
  },
  'stream': {
    $url: $url_1tp1ur6(option),
    ...methods_1tp1ur6(option),
  },
  $url: $url_17yqnk1(option),
  $build(req: Parameters<ReturnType<typeof methods_17yqnk1>['$get']>[0] | null): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_17yqnk1>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods_17yqnk1>['$get']>>>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '/api/test-client', ...rest }, () => methods_17yqnk1(option).$get(req)];
  },
  ...methods_17yqnk1(option),
});

export const $fc = (option?: FrourioClientOption) => ({
  '[userId]': {
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
  },
  'stream': {
    $url: {
      post(): string {
        const result = $url_1tp1ur6(option).post();

        if (!result.isValid) throw result.reason;

        return result.data;
      },
    },
    async $post(req: Parameters<ReturnType<typeof methods_1tp1ur6>['$post']>[0]): Promise<Response> {
      const result = await methods_1tp1ur6(option).$post(req);

      if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

      if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

      return result.data;
    },
  },
  $url: {
    get(req: Parameters<ReturnType<typeof $url_17yqnk1>['get']>[0]): string {
      const result = $url_17yqnk1(option).get(req);

      if (!result.isValid) throw result.reason;

      return result.data;
    },
    post(): string {
      const result = $url_17yqnk1(option).post();

      if (!result.isValid) throw result.reason;

      return result.data;
    },
    patch(): string {
      const result = $url_17yqnk1(option).patch();

      if (!result.isValid) throw result.reason;

      return result.data;
    },
  },
  $build(req: Parameters<ReturnType<typeof methods_17yqnk1>['$get']>[0] | null): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods_17yqnk1>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<z.infer<typeof frourioSpec_17yqnk1.get.res[200]['body']>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '/api/test-client', ...rest }, () => $fc(option).$get(req)];
  },
  async $get(req: Parameters<ReturnType<typeof methods_17yqnk1>['$get']>[0]): Promise<z.infer<typeof frourioSpec_17yqnk1.get.res[200]['body']>> {
    const result = await methods_17yqnk1(option).$get(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
  async $post(req: Parameters<ReturnType<typeof methods_17yqnk1>['$post']>[0]): Promise<z.infer<typeof frourioSpec_17yqnk1.post.res[201]['body']>> {
    const result = await methods_17yqnk1(option).$post(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
  async $patch(req: Parameters<ReturnType<typeof methods_17yqnk1>['$patch']>[0]): Promise<z.infer<typeof frourioSpec_17yqnk1.patch.res[200]['body']>> {
    const result = await methods_17yqnk1(option).$patch(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.failure.status}`);

    return result.data.body;
  },
});

export const fc_17yqnk1 = fc;

export const $fc_17yqnk1 = $fc;

const paramsSchema_1rqfh40 = z.object({ 'userId': frourioSpec_1rqfh40.param });

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

const methods_17yqnk1 = (option?: FrourioClientOption) => ({
  async $get(req: { query: z.infer<typeof frourioSpec_17yqnk1.get.query>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_17yqnk1.get.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 400; headers?: undefined; body: z.infer<typeof frourioSpec_17yqnk1.get.res[400]['body']> }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_17yqnk1(option).get(req);

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

        const body = frourioSpec_17yqnk1.get.res[200].body.safeParse(resBody.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data },
          raw: result.res,
        };
      }
      case 400: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: false, raw: result.res, error: resBody.error };

        const body = frourioSpec_17yqnk1.get.res[400].body.safeParse(resBody.data);

        if (!body.success) return { ok: false, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: false,
          isValid: true,
          failure: { status: 400, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
  async $post(req: { body: z.infer<typeof frourioSpec_17yqnk1.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 201; headers?: undefined; body: z.infer<typeof frourioSpec_17yqnk1.post.res[201]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 400; headers?: undefined; body: z.infer<typeof frourioSpec_17yqnk1.post.res[400]['body']> } | { status: 422; headers?: undefined; body: z.infer<typeof frourioSpec_17yqnk1.post.res[422]['body']> }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_17yqnk1(option).post();

    if (url.reason) return url;

    const parsedBody = frourioSpec_17yqnk1.post.body.safeParse(req.body);

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
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_17yqnk1.post.res[201].body.safeParse(resBody.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 201, body: body.data },
          raw: result.res,
        };
      }
      case 400: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: false, raw: result.res, error: resBody.error };

        const body = frourioSpec_17yqnk1.post.res[400].body.safeParse(resBody.data);

        if (!body.success) return { ok: false, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: false,
          isValid: true,
          failure: { status: 400, body: body.data },
          raw: result.res,
        };
      }
      case 422: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: false, raw: result.res, error: resBody.error };

        const body = frourioSpec_17yqnk1.post.res[422].body.safeParse(resBody.data);

        if (!body.success) return { ok: false, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: false,
          isValid: true,
          failure: { status: 422, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
  async $patch(req: { body: z.infer<typeof frourioSpec_17yqnk1.patch.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec_17yqnk1.patch.res[200]['body']> }; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: { status: 400; headers?: undefined; body: z.infer<typeof frourioSpec_17yqnk1.patch.res[400]['body']> }; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_17yqnk1(option).patch();

    if (url.reason) return url;

    const parsedBody = frourioSpec_17yqnk1.patch.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, reason: parsedBody.error };

    const formData = new FormData();

    Object.entries(parsedBody.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach((item) =>
          item instanceof File
            ? formData.append(key, item, item.name)
            : formData.append(key, item.toString()),
        );
      } else if (value instanceof File) {
        formData.set(key, value, value.name);
      } else {
        formData.set(key, value.toString());
      }
    });

    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: 'PATCH',
        ...option?.init,
        body: formData,
        ...req.init,
        headers: { ...option?.init?.headers, ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: true, raw: result.res, error: resBody.error };

        const body = frourioSpec_17yqnk1.patch.res[200].body.safeParse(resBody.data);

        if (!body.success) return { ok: true, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data },
          raw: result.res,
        };
      }
      case 400: {
        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: false, raw: result.res, error: resBody.error };

        const body = frourioSpec_17yqnk1.patch.res[400].body.safeParse(resBody.data);

        if (!body.success) return { ok: false, isValid: false, raw: result.res, reason: body.error };

        return {
          ok: false,
          isValid: true,
          failure: { status: 400, body: body.data },
          raw: result.res,
        };
      }
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
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

const methods_1tp1ur6 = (option?: FrourioClientOption) => ({
  async $post(req: { body: z.infer<typeof frourioSpec_1tp1ur6.post.body>, init?: RequestInit }): Promise<
    | { ok: true; isValid: true; data: Response; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: Response; raw: Response; reason?: undefined; error?: undefined }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url_1tp1ur6(option).post();

    if (url.reason) return url;

    const parsedBody = frourioSpec_1tp1ur6.post.body.safeParse(req.body);

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

    return result.res.ok ? { ok: true, isValid: true, data: result.res, raw: result.res } : { ok: false, isValid: true, failure: result.res, raw: result.res };
  },
});

