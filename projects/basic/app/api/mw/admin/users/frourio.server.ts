import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { middleware as ancestorMiddleweare } from '../route';
import { contextSchema as ancestorContextSchema, type ContextType as AncestorContextType } from '../frourio.server';
import { frourioSpec } from './frourio';
import type { GET, middleware } from './route';

type RouteChecker = [typeof GET, typeof middleware];

type SpecType = typeof frourioSpec;

const contextSchema = ancestorContextSchema;

type ContextType = z.infer<typeof contextSchema>;

type Middleware = (
  args: {
    req: Request,
    next: (req: Request) => Promise<Response>,
  },
  ctx: AncestorContextType,
) => Promise<Response>;

type Controller = {
  middleware: Middleware;
  get: (
    req: {
      query: z.infer<SpecType['get']['query']>;
    },
    ctx: ContextType,
  ) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['get']['res'][200]['body']>;
      }
    | {
        status: 403;
        body: z.infer<SpecType['get']['res'][403]['body']>;
      }
  >;
};

type ResHandler = {
  middleware: (next: (
    args: { req: Request },
    ctx: ContextType,
  ) => Promise<Response>) => (originalReq: Request, option?: {}) => Promise<Response>;
  GET: (req: Request) => Promise<Response>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    args: { req: Request },
    ctx: ContextType,
  ) => Promise<Response>) => async (originalReq: Request): Promise<Response> => {

    return ancestorMiddleweare(async (ancestorArgs, ancestorContext) => {
      const ancestorCtx = ancestorContextSchema.safeParse(ancestorContext);

      if (ancestorCtx.error) return createReqErr(ancestorCtx.error);
    return await controller.middleware(
      {
        req: ancestorArgs.req,
        next: async (req) => {


      return await next({ req }, { ...ancestorCtx.data, })
      },
      },
      ancestorCtx.data,
    )
    })(originalReq)
  };

  return {
    middleware,
    GET: middleware(async ({ req }, ctx) => {
      const { searchParams } = new URL(req.url);
      const query = frourioSpec.get.query.safeParse({
        'role': searchParams.get('role') ?? undefined,
      });

      if (query.error) return createReqErr(query.error);

      const res = await controller.get({ query: query.data }, ctx);

      switch (res.status) {
        case 200: {
          const body = frourioSpec.get.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        case 403: {
          const body = frourioSpec.get.res[403].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 403 });
        }
        default:
          throw new Error(res satisfies never);
      }
    }),
  };
};

const createResponse = (body: unknown, init: ResponseInit): Response => {
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
