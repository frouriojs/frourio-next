import { NextResponse } from 'next/server';
import { z } from 'zod';
import { frourioSpec } from './frourio';
import type { PUT, DELETE } from './route';

type RouteChecker = [typeof PUT, typeof DELETE];

const paramToNum = <T extends z.ZodTypeAny>(schema: T) =>
  z.string().or(z.number()).transform<z.infer<T>>((val, ctx) => {
    const numVal = Number(val);
    const parsed = schema.safeParse(isNaN(numVal) ? val : numVal);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

export const paramsSchema = z.object({ 'userId': paramToNum(frourioSpec.param) });

type ParamsType = z.infer<typeof paramsSchema>;

type SpecType = typeof frourioSpec;

type Controller = {
  put: (
    req: {
      params: ParamsType;
      body: z.infer<SpecType['put']['body']>;
    },
  ) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['put']['res'][200]['body']>;
      }
    | {
        status: 404;
        body: z.infer<SpecType['put']['res'][404]['body']>;
      }
  >;
  delete: (
    req: {
      params: ParamsType;
    },
  ) => Promise<
    | {
        status: 204;
      }
    | {
        status: 404;
        body: z.infer<SpecType['delete']['res'][404]['body']>;
      }
  >;
};

type ResHandler = {
  PUT: (req: Request, option: { params: Promise<ParamsType> }) => Promise<NextResponse>;
  DELETE: (req: Request, option: { params: Promise<ParamsType> }) => Promise<NextResponse>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    args: { req: Request, params: ParamsType },
  ) => Promise<NextResponse>) => async (req: Request, option: { params: Promise<ParamsType> }): Promise<NextResponse> => {
    const params = paramsSchema.safeParse(await option.params);

    if (params.error) return createReqErr(params.error);

    
    

      return await next({ req, params: params.data })
      
    
  };

  return {
    PUT: middleware(async ({ req, params }) => {
      const body = frourioSpec.put.body.safeParse(await req.json().catch(() => undefined));

      if (body.error) return createReqErr(body.error);

      const res = await controller.put({ body: body.data, params });

      switch (res.status) {
        case 200: {
          const body = frourioSpec.put.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        case 404: {
          const body = frourioSpec.put.res[404].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 404 });
        }
        default:
          throw new Error(res satisfies never);
      }
    }),
    DELETE: middleware(async ({ req, params }) => {
      const res = await controller.delete({ params });

      switch (res.status) {
        case 204: {
          return new NextResponse(null, { status: 204 });
        }
        case 404: {
          const body = frourioSpec.delete.res[404].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 404 });
        }
        default:
          throw new Error(res satisfies never);
      }
    }),
  };
};

const createResponse = (body: unknown, init: ResponseInit): NextResponse => {
  if (
    ArrayBuffer.isView(body) ||
    body === undefined ||
    body === null ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof FormData ||
    body instanceof ReadableStream ||
    body instanceof URLSearchParams ||
    typeof body === 'string'
  ) {
    return new NextResponse(body, init);
  }

  return NextResponse.json(body, init);
};

type FrourioError =
  | { status: 422; error: string; issues: { path: (string | number)[]; message: string }[] }
  | { status: 500; error: string; issues?: undefined };

const createReqErr = (err: z.ZodError) =>
  NextResponse.json<FrourioError>(
    {
      status: 422,
      error: 'Unprocessable Entity',
      issues: err.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    },
    { status: 422 },
  );

const createResErr = () =>
  NextResponse.json<FrourioError>(
    { status: 500, error: 'Internal Server Error' },
    { status: 500 },
  );
