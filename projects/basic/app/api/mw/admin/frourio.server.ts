import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { middleware as ancestorMiddleweare } from '../route';
import { contextSchema as ancestorContextSchema, type ContextType as AncestorContextType } from '../frourio.server';
import { frourioSpec } from './frourio';
import type { GET, POST, middleware } from './route';

type RouteChecker = [typeof GET, typeof POST, typeof middleware];

type SpecType = typeof frourioSpec;

export const contextSchema = frourioSpec.middleware.context.and(ancestorContextSchema);

export type ContextType = z.infer<typeof contextSchema>;

type Middleware = (
  args: {
    req: NextRequest,
    next: (req: NextRequest, ctx: z.infer<typeof frourioSpec.middleware.context>) => Promise<Response>,
  },
  ctx: AncestorContextType,
) => Promise<Response>;

type Controller = {
  middleware: Middleware;
  get: (
    req: {
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
  post: (
    req: {
      body: z.infer<SpecType['post']['body']>;
    },
    ctx: ContextType,
  ) => Promise<
    | {
        status: 201;
        body: z.infer<SpecType['post']['res'][201]['body']>;
      }
    | {
        status: 403;
        body: z.infer<SpecType['post']['res'][403]['body']>;
      }
  >;
};

type ResHandler = {
  middleware: (next: (
    args: { req: NextRequest },
    ctx: ContextType,
  ) => Promise<Response>) => (originalReq: NextRequest, option: {}) => Promise<Response>;
  GET: (req: NextRequest, option: {}) => Promise<Response>;
  POST: (req: NextRequest, option: {}) => Promise<Response>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    args: { req: NextRequest },
    ctx: ContextType,
  ) => Promise<Response>) => async (originalReq: NextRequest, option: {}): Promise<Response> => {

    return ancestorMiddleweare(async (ancestorArgs, ancestorContext) => {
      const ancestorCtx = ancestorContextSchema.safeParse(ancestorContext);

      if (ancestorCtx.error) return createReqErr(ancestorCtx.error);
    return await controller.middleware(
      {
        req: ancestorArgs.req,
        next: async (req, context) => {
      const ctx = frourioSpec.middleware.context.safeParse(context);

      if (ctx.error) return createReqErr(ctx.error);

      return await next({ req }, { ...ancestorCtx.data,...ctx.data })
      },
      },
      ancestorCtx.data,
    )
    })(originalReq, option)
  };

  return {
    middleware,
    GET: middleware(async ({ req }, ctx) => {
      const res = await controller.get({  }, ctx);

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
    POST: middleware(async ({ req }, ctx) => {
      const body = frourioSpec.post.body.safeParse(await req.json().catch(() => undefined));

      if (body.error) return createReqErr(body.error);

      const res = await controller.post({ body: body.data }, ctx);

      switch (res.status) {
        case 201: {
          const body = frourioSpec.post.res[201].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 201 });
        }
        case 403: {
          const body = frourioSpec.post.res[403].body.safeParse(res.body);

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
