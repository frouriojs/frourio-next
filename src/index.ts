import type { z } from 'zod';

type ResValue = { headers?: z.ZodTypeAny; body: z.ZodTypeAny };

type digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type Res = { [Status in `${2 | 4 | 5}${digit}${digit}`]?: ResValue };

export type FrourioSpec = {
  get?: { headers?: z.ZodTypeAny; query?: z.ZodTypeAny; res: Res };
} & {
  [method in 'post' | 'patch' | 'put' | 'delete']?: {
    headers?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
    res: Res;
  };
};
