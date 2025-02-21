import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { frourioSpec } from './frourio';
import type { GET } from './route';

type RouteChecker = [typeof GET];

export const paramsValidator = z.object({ 'pid': z.string() });

type SpecType = typeof frourioSpec;

type Controller = {
  get: (req: {
    params: z.infer<typeof paramsValidator>;
    query: z.infer<SpecType['get']['query']>;
  }) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['get']['res'][200]['body']>;
      }
  >;
};

type FrourioError =
  | { status: 422; error: string; issues: { path: (string | number)[]; message: string }[] }
  | { status: 500; error: string; issues?: undefined };

type ResHandler = {
  GET: (
    req: NextRequest,
    option: { params: Promise<unknown> },
  ) => Promise<
    NextResponse<
      | z.infer<SpecType['get']['res'][200]['body']>
      | FrourioError
    >
  >;
};

const toHandler = (controller: Controller): ResHandler => {
  return {
    GET: async (req, option) => {
      const query = frourioSpec.get.query.safeParse({
        'requiredNum': queryToNum(req.nextUrl.searchParams.get('requiredNum') ?? undefined),
        'requiredNumArr': queryToNumArr(req.nextUrl.searchParams.getAll('requiredNumArr')),
        'id': req.nextUrl.searchParams.get('id') ?? undefined,
        'strArray': req.nextUrl.searchParams.getAll('strArray'),
        'disable': req.nextUrl.searchParams.get('disable') ?? undefined,
        'bool': queryToBool(req.nextUrl.searchParams.get('bool') ?? undefined),
        'boolArray': queryToBoolArr(req.nextUrl.searchParams.getAll('boolArray')),
        'symbolIds': req.nextUrl.searchParams.getAll('symbolIds'),
        'maybeIds': queryToNumArr(req.nextUrl.searchParams.getAll('maybeIds')),
        'optionalNum': queryToNum(req.nextUrl.searchParams.get('optionalNum') ?? undefined),
        'optionalNumArr': queryToNumArr(req.nextUrl.searchParams.getAll('optionalNumArr')).length > 0 ? queryToNumArr(req.nextUrl.searchParams.getAll('optionalNumArr')) : undefined,
        'emptyNum': queryToNum(req.nextUrl.searchParams.get('emptyNum') ?? undefined),
        'optionalStrArray': req.nextUrl.searchParams.getAll('optionalStrArray').length > 0 ? req.nextUrl.searchParams.getAll('optionalStrArray') : undefined,
        'optionalBool': queryToBool(req.nextUrl.searchParams.get('optionalBool') ?? undefined),
        'optionalBoolArray': queryToBoolArr(req.nextUrl.searchParams.getAll('optionalBoolArray')).length > 0 ? queryToBoolArr(req.nextUrl.searchParams.getAll('optionalBoolArray')) : undefined,
        'optionalZodIds': queryToNumArr(req.nextUrl.searchParams.getAll('optionalZodIds')).length > 0 ? queryToNumArr(req.nextUrl.searchParams.getAll('optionalZodIds')) : undefined,
      });

      if (query.error) return createReqErr(query.error);

      const params = paramsValidator.safeParse(await option.params);

      if (params.error) return createReqErr(params.error);

      const res = await controller.get({ params: params.data, query: query.data });

      switch (res.status) {
        case 200: {
          const body = frourioSpec.get.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        default:
          throw new Error(res.status satisfies never);
      }
    },
  };
};

export function createRoute(controller: Controller): ResHandler;
export function createRoute<T extends Record<string, unknown>>(
  deps: T,
  cb: (d: T) => Controller,
): ResHandler & { inject: (d: T) => ResHandler };
export function createRoute<T extends Record<string, unknown>>(
  controllerOrDeps: Controller | T,
  cb?: (d: T) => Controller,
) {
  if (cb === undefined) return toHandler(controllerOrDeps as Controller);

  return { ...toHandler(cb(controllerOrDeps as T)), inject: (d: T) => toHandler(cb(d)) };
}

const createResponse = <T>(body: T, init: ResponseInit): NextResponse<T> => {
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
    return new NextResponse(body as BodyInit, init);
  }

  return NextResponse.json(body, init);
};

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
