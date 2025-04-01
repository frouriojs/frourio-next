import { z } from 'zod';
import { frourioSpec } from './frourio'

const $path = {
  post(req: {  }): { isValid: true; data: string; error?: undefined } | { isValid: false, data?: undefined; error: z.ZodError } {
    return { isValid: true, data: `/%E6%97%A5%E6%9C%AC%E8%AA%9E` };
  },
};

export const fc_10q2n2o = {
  $path,
  async $post(req: { body: z.infer<typeof frourioSpec.post.body>, init?: RequestInit }): Promise<
    { ok: true; isValid: true; data: { status: 200; headers?: undefined; body: z.infer<typeof frourioSpec.post.res[200]['body']> }; error?: undefined } |
    { ok: false; isValid: true; data?: undefined; error?: undefined } |
    { ok: boolean; isValid: false; data: Response; error: z.ZodError } |
    { ok: boolean; isValid?: undefined; data: Response; error: unknown } |
    { ok?: undefined; isValid: false; data?: undefined; error: z.ZodError } |
    { ok?: undefined; isValid?: undefined; data?: undefined; error: unknown }
  > {
    const url = $path.post(req);

    if (url.error) return url;

    const parsedBody = frourioSpec.post.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, error: parsedBody.error };

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

    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetch(
      url.data,
      {
        method: 'POST',
        body: formData,
        ...req.init,
        headers: { 'content-type': 'multipart/form-data', ...req.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    switch (result.res.status) {
      case 200: {
        const json: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.json().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!json.success) return { ok: true, data: result.res, error: json.error };

        const body = frourioSpec.post.res[200].body.safeParse(json.data);

        if (!body.success) return { ok: true, data: result.res, error: body.error };

        return {
          ok: true,
          isValid: true,
          data: { status: 200, body: body.data }
        };
      }
      default:
        return { ok: result.res.ok, data: result.res, error: new Error(`Unknown status: ${result.res.status}`) };
    }
  },
};
