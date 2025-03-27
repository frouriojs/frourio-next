import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { middleware as ancestorMiddleweare } from '../../route';
import { contextSchema as ancestorContextSchema } from '../../frourio.server';
import { frourioSpec } from './frourio';
import type { GET } from './route';

type RouteChecker = [typeof GET];

const paramToNumArr = <T extends z.ZodTypeAny>(validator: T) =>
  z.array(z.string().or(z.number())).optional().transform<z.infer<T>>((val, ctx) => {
    const numArr = val?.map((v) => {
      const numVal = Number(v);

      return isNaN(numVal) ? v : numVal;
    });
    const parsed = validator.safeParse(numArr);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

export const paramsValidator = z.object({ 'slug': paramToNumArr(frourioSpec.param) });

type ParamsType = z.infer<typeof paramsValidator>;

type SpecType = typeof frourioSpec;

const contextSchema = ancestorContextSchema;

type ContextType = z.infer<typeof contextSchema>;

type Controller = {
  get: (req: ContextType & {
    params: ParamsType;
  }) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['get']['res'][200]['body']>;
      }
  >;
};

type ResHandler = {
  GET: (req: NextRequest, ctx: { params: Promise<ParamsType> }) => Promise<Response>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    req: NextRequest,
    ctx: ContextType & { params: ParamsType },
  ) => Promise<Response>) => async (originalReq: NextRequest, originalCtx: { params: Promise<ParamsType> }): Promise<Response> => {
    const params = paramsValidator.safeParse(await originalCtx.params);

    if (params.error) return createReqErr(params.error);

    return ancestorMiddleweare(async (req, context) => {
      const ctx = ancestorContextSchema.safeParse(context);

      if (ctx.error) return createReqErr(ctx.error);
    

      return await next(req, { ...ctx.data,params: params.data })
       
    })(originalReq, originalCtx)
  };

  return {
    GET: middleware(async (req, ctx) => {
      const res = await controller.get({ ...ctx });

      switch (res.status) {
        case 200: {
          const body = frourioSpec.get.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        default:
          throw new Error(res.status satisfies never);
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
