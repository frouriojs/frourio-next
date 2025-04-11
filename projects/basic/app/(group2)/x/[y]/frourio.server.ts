import { NextResponse } from 'next/server';
import { z } from 'zod';
import { middleware as ancestorMiddleware } from '../../route';
import { frourioSpec } from './frourio';
import type { GET, middleware } from './route';

type RouteChecker = [typeof GET, typeof middleware];

export const paramsSchema = z.object({ 'y': z.string() });

type ParamsType = z.infer<typeof paramsSchema>;

type SpecType = typeof frourioSpec;

type Middleware = (
  args: {
    req: Request,
    params: ParamsType,
    next: (req: Request) => Promise<NextResponse>,
  },
) => Promise<NextResponse>;

type Controller = {
  middleware: Middleware;
  get: (
    req: {
      params: ParamsType;
      query: z.infer<SpecType['get']['query']>;
    },
  ) => Promise<Response>;
};

type ResHandler = {
  middleware: (next: (
    args: { req: Request, params: ParamsType },
  ) => Promise<NextResponse>) => (originalReq: Request, option: {params: Promise<ParamsType> }) => Promise<NextResponse>;
  GET: (req: Request, option: { params: Promise<ParamsType> }) => Promise<NextResponse>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    args: { req: Request, params: ParamsType },
  ) => Promise<NextResponse>) => async (originalReq: Request, option: { params: Promise<ParamsType> }): Promise<NextResponse> => {
    const params = paramsSchema.safeParse(await option.params);

    if (params.error) return createReqErr(params.error);

    return ancestorMiddleware(async (ancestorArgs) => {

    return await controller.middleware(
      {
        req: ancestorArgs.req,
        params: params.data,
        next: async (req) => {


      return await next({ req, params: params.data })
      },
      },
    )
    })(originalReq)
  };

  return {
    middleware,
    GET: middleware(async ({ req, params }) => {
      const { searchParams } = new URL(req.url);
      const query = frourioSpec.get.query.safeParse({
        'message': searchParams.get('message') ?? undefined,
      });

      if (query.error) return createReqErr(query.error);

      const res = await controller.get({ query: query.data, params });

      return new NextResponse(res.body, res);
    }),
  };
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
