import { NextResponse } from 'next/server';
import { z } from 'zod';
import { middleware as ancestorMiddleware } from '../route';
import { contextSchema as ancestorContextSchema } from '../frourio.server';
import { frourioSpec } from './frourio';
import type { GET } from './route';

type RouteChecker = [typeof GET];

export const paramsSchema = z.object({ 'pid': z.string() });

type ParamsType = z.infer<typeof paramsSchema>;

type SpecType = typeof frourioSpec;

const contextSchema = ancestorContextSchema;

type ContextType = z.infer<typeof contextSchema>;

type Controller = {
  get: (
    req: {
      params: ParamsType;
      query: z.infer<SpecType['get']['query']>;
    },
    ctx: ContextType,
  ) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['get']['res'][200]['body']>;
      }
  >;
};

type ResHandler = {
  GET: (req: Request, option: { params: Promise<ParamsType> }) => Promise<Response>;
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    args: { req: Request, params: ParamsType },
    ctx: ContextType,
  ) => Promise<Response>) => async (originalReq: Request, option: { params: Promise<ParamsType> }): Promise<Response> => {
    const params = paramsSchema.safeParse(await option.params);

    if (params.error) return createReqErr(params.error);

    return ancestorMiddleware(async (ancestorArgs, ancestorContext) => {
      const ancestorCtx = ancestorContextSchema.safeParse(ancestorContext);

      if (ancestorCtx.error) return createReqErr(ancestorCtx.error);
    

      return await next({ req: ancestorArgs.req, params: params.data }, { ...ancestorCtx.data, })
      
    })(originalReq)
  };

  return {
    GET: middleware(async ({ req, params }, ctx) => {
      const { searchParams } = new URL(req.url);
      const query = frourioSpec.get.query.safeParse({
        'requiredNum': queryToNum(searchParams.get('requiredNum') ?? undefined),
        'requiredNumArr': queryToNumArr(searchParams.getAll('requiredNumArr')),
        'id': searchParams.get('id') ?? undefined,
        'strArray': searchParams.getAll('strArray'),
        'disable': searchParams.get('disable') ?? undefined,
        'bool': queryToBool(searchParams.get('bool') ?? undefined),
        'boolArray': queryToBoolArr(searchParams.getAll('boolArray')),
        'symbolIds': searchParams.getAll('symbolIds'),
        'maybeIds': queryToNumArr(searchParams.getAll('maybeIds')),
        'optionalNum': queryToNum(searchParams.get('optionalNum') ?? undefined),
        'optionalNumArr': searchParams.getAll('optionalNumArr').length > 0 ? queryToNumArr(searchParams.getAll('optionalNumArr')) : undefined,
        'emptyNum': queryToNum(searchParams.get('emptyNum') ?? undefined),
        'optionalStrArray': searchParams.getAll('optionalStrArray').length > 0 ? searchParams.getAll('optionalStrArray') : undefined,
        'optionalBool': queryToBool(searchParams.get('optionalBool') ?? undefined),
        'optionalBoolArray': searchParams.getAll('optionalBoolArray').length > 0 ? queryToBoolArr(searchParams.getAll('optionalBoolArray')) : undefined,
        'optionalZodIds': searchParams.getAll('optionalZodIds').length > 0 ? queryToNumArr(searchParams.getAll('optionalZodIds')) : undefined,
      });

      if (query.error) return createReqErr(query.error);

      const res = await controller.get({ query: query.data, params }, ctx);

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

const queryToNum = (val: string | undefined) => {
  const num = Number(val);

  return isNaN(num) ? val : num;
};

const queryToNumArr = (val: string[]) =>
  val.map((v) => {
    const numVal = Number(v);

    return isNaN(numVal) ? v : numVal;
  });

const queryToBool = (val: string | undefined) =>
  val === 'true' ? true : val === 'false' ? false : val;

const queryToBoolArr = (val: string[]) =>
  val.map((v) => (v === 'true' ? true : v === 'false' ? false : v));
