import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { frourioSpec } from './frourio'

export const fc_13e9lnf = (option?: FrourioClientOption) => ({
  $path: $path(option),
  ...methods(option),
});

export const $fc_13e9lnf = (option?: FrourioClientOption) => ({
  $path: {
    get(req: Parameters<ReturnType<typeof $path>['get']>[0]): string {
      const result = $path(option).get(req);

      if (!result.isValid) throw result.error;

      return result.data;
    },
  },
  async $get(req: Parameters<ReturnType<typeof methods>['$get']>[0]): Promise<Response> {
    const result = await methods(option).$get(req);

    if (!result.isValid) throw result.error;

    if (!result.ok) throw new Error(`HTTP Error: ${result.data.status}`);

    return result.data;
  },
});

const paramsSchema = z.object({ 'y': z.string() });

const $path = (option?: FrourioClientOption) => ({
  get(req: { params: z.infer<typeof paramsSchema>,query: z.infer<typeof frourioSpec.get.query> }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, error: parsedParams.error };

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

    return { isValid: true, data: `${option?.baseURL ?? ''}/x/${parsedParams.data.y}?${searchParams.toString()}` };
  },
});

const methods = (option?: FrourioClientOption) => ({
  async $get(req: { params: z.infer<typeof paramsSchema>, query: z.infer<typeof frourioSpec.get.query>, init?: RequestInit }): Promise<
    | { ok: boolean; isValid: true; data: Response; error?: undefined }
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
        ...req.init,
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    return { ok: result.res.ok, isValid: true, data: result.res };
  },
});
