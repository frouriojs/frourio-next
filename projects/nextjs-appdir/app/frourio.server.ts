import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { frourioSpec } from './frourio';
import type { GET, POST } from './route';

type RouteChecker = [typeof GET, typeof POST];

type SpecType = typeof frourioSpec;

type Controller = {
  get: (req: {
    headers: z.infer<SpecType['get']['headers']>;
    query: z.infer<SpecType['get']['query']>;
  }) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['get']['res'][200]['body']>;
      }
    | {
        status: 404;
        body: z.infer<SpecType['get']['res'][404]['body']>;
      }
  >;
  post: (req: {
    body: z.infer<SpecType['post']['body']>;
  }) => Promise<
    | {
        status: 201;
        headers: z.infer<SpecType['post']['res'][201]['headers']>;
        body: z.infer<SpecType['post']['res'][201]['body']>;
      }
  >;
};

type FrourioErr =
  | { status: 422; error: string; issues: { path: (string | number)[]; message: string }[] }
  | { status: 500; error: string; issues?: undefined };

type ResHandler = {
  GET: (
    req: NextRequest,
  ) => Promise<
    NextResponse<
      | z.infer<SpecType['get']['res'][200]['body']>
      | z.infer<SpecType['get']['res'][404]['body']>
      | FrourioErr
    >
  >;
  POST: (
    req: NextRequest,
  ) => Promise<
    NextResponse<
      | z.infer<SpecType['post']['res'][201]['body']>
      | FrourioErr
    >
  >;
};

const toHandler = (controller: Controller): ResHandler => {
  return {
    GET: async (req) => {
      const headers = frourioSpec.get.headers.safeParse(Object.fromEntries(req.headers));

      if (headers.error) return createReqErr(headers.error);

      const query = frourioSpec.get.query.safeParse({
        aa: req.nextUrl.searchParams.get('aa') ?? undefined,
      });

      if (query.error) return createReqErr(query.error);

      const res = await controller.get({ headers: headers.data, query: query.data });

      switch (res.status) {
        case 200: {
          const body = frourioSpec.get.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        case 404: {
          const body = frourioSpec.get.res[404].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 404 });
        }
        default:
          throw new Error(res satisfies never);
      }
    },
    POST: async (req) => {
      const body = frourioSpec.post.body.safeParse(await req.json().catch(() => undefined));

      if (body.error) return createReqErr(body.error);

      const res = await controller.post({ body: body.data });

      switch (res.status) {
        case 201: {
          const headers = frourioSpec.post.res[201].headers.safeParse(res.headers);

          if (headers.error) return createResErr();

          const body = frourioSpec.post.res[201].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 201, headers: headers.data });
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
