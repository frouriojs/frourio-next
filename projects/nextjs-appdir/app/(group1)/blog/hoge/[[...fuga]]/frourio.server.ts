import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { frourioSpec } from './frourio';
import type { GET } from './route';

type RouteChecker = [typeof GET];

export const paramsValidator = z.object({ fuga: frourioSpec.param });

type SpecType = typeof frourioSpec;

type Controller = {
  get: (req: {
    params: z.infer<typeof paramsValidator>;
  }) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['get']['res'][200]['body']>;
      }
  >;
};

type FrourioErr =
  | { status: 422; error: string; issues: { path: (string | number)[]; message: string }[] }
  | { status: 500; error: string; issues?: undefined };

type ResHandler = {
  GET: (
    req: NextRequest,
    option: { params: Promise<unknown> },
  ) => Promise<
    NextResponse<
      | z.infer<SpecType['get']['res'][200]['body']>
      | FrourioErr
    >
  >;
};

const toHandler = (controller: Controller): ResHandler => {
  return {
    GET: async (req, option) => {
      const params = paramsValidator.safeParse(await option.params);

      if (params.error) return createReqErr(params.error);

      const res = await controller.get({ params: params.data });

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
  NextResponse.json<FrourioErr>(
    {
      status: 422,
      error: 'Unprocessable Entity',
      issues: err.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    },
    { status: 422 },
  );

const createResErr = () =>
  NextResponse.json<FrourioErr>(
    { status: 500, error: 'Internal Server Error' },
    { status: 500 },
  );
