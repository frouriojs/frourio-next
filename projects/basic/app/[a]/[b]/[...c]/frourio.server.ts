import { NextResponse } from 'next/server';
import { z } from 'zod';
import { paramsSchema as ancestorParamsSchema } from '../../frourio.server';
import { middleware as ancestorMiddleware } from '../../route';
import { contextSchema as ancestorContextSchema, type ContextType as AncestorContextType } from '../../frourio.server';
import { frourioSpec } from './frourio';
import type { POST, middleware } from './route';

type RouteChecker = [typeof POST, typeof middleware];

export const paramsSchema = z.object({ 'c': z.array(z.string()) }).and(ancestorParamsSchema).and(z.object({ 'b': z.string() }));

type ParamsType = z.infer<typeof paramsSchema>;

type SpecType = typeof frourioSpec;

export const contextSchema = frourioSpec.middleware.context.and(ancestorContextSchema);

export type ContextType = z.infer<typeof contextSchema>;

type Middleware = (
  args: {
    req: Request,
    params: ParamsType,
    next: (req: Request, ctx: z.infer<typeof frourioSpec.middleware.context>) => Promise<NextResponse>,
  },
  ctx: AncestorContextType,
) => Promise<NextResponse>;

type Controller = {
  middleware: Middleware;
  post: (
    req: {
      params: ParamsType;
    },
    ctx: ContextType,
  ) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['post']['res'][200]['body']>;
      }
  >;
};

type ResHandler = {
  middleware: (next: (
    args: { req: Request, params: ParamsType },
    ctx: ContextType,
  ) => Promise<NextResponse>) => (originalReq: Request, option: {params: Promise<ParamsType> }) => Promise<NextResponse>;
  POST: (req: Request, option: { params: Promise<ParamsType> }) => Promise<NextResponse>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    args: { req: Request, params: ParamsType },
    ctx: ContextType,
  ) => Promise<NextResponse>) => async (originalReq: Request, option: { params: Promise<ParamsType> }): Promise<NextResponse> => {
    const params = paramsSchema.safeParse(await option.params);

    if (params.error) return createReqErr(params.error);

    return ancestorMiddleware(async (ancestorArgs, ancestorContext) => {
      const ancestorCtx = ancestorContextSchema.safeParse(ancestorContext);

      if (ancestorCtx.error) return createReqErr(ancestorCtx.error);
    return await controller.middleware(
      {
        req: ancestorArgs.req,
        params: params.data,
        next: async (req, context) => {
      const ctx = frourioSpec.middleware.context.safeParse(context);

      if (ctx.error) return createReqErr(ctx.error);

      return await next({ req, params: params.data }, { ...ancestorCtx.data,...ctx.data })
      },
      },
      ancestorCtx.data,
    )
    })(originalReq, option)
  };

  return {
    middleware,
    POST: middleware(async ({ req, params }, ctx) => {
      const res = await controller.post({ params }, ctx);

      switch (res.status) {
        case 200: {
          const body = frourioSpec.post.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        default:
          throw new Error(res.status satisfies never);
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
