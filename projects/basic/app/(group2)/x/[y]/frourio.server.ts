import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { middleware as ancestorMiddleweare } from '../../route';
import { frourioSpec } from './frourio';
import type { GET } from './route';

type RouteChecker = [typeof GET];

export const paramsValidator = z.object({ 'y': z.string() });

type ParamsType = z.infer<typeof paramsValidator>;

type SpecType = typeof frourioSpec;


type Controller = {
  get: (req: {
    params: ParamsType;
    query: z.infer<SpecType['get']['query']>;
  }) => Promise<Response>;
};

type ResHandler = {
  GET: (req: NextRequest, ctx: { params: Promise<ParamsType> }) => Promise<Response>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    req: NextRequest,
    ctx: { params: ParamsType },
  ) => Promise<Response>) => async (originalReq: NextRequest, originalCtx: { params: Promise<ParamsType> }): Promise<Response> => {
    const params = paramsValidator.safeParse(await originalCtx.params);

    if (params.error) return createReqErr(params.error);

    return ancestorMiddleweare(async (req) => {

    

      return await next(req, { params: params.data })
       
    })(originalReq, originalCtx)
  };

  return {
    GET: middleware(async (req, ctx) => {
      const query = frourioSpec.get.query.safeParse({
        'message': req.nextUrl.searchParams.get('message') ?? undefined,
      });

      if (query.error) return createReqErr(query.error);

      const res = await controller.get({ ...ctx, query: query.data });

      return res;
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
