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
        status: 201;
        headers: z.infer<SpecType['get']['res'][201]['headers']>;
        body: z.infer<SpecType['get']['res'][201]['body']>;
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
        status: 200;
        body: z.infer<SpecType['post']['res'][200]['body']>;
      }
  >;
};

type ResHandler = {
  GET: (
    req: NextRequest,
  ) => Promise<
    NextResponse<
      | z.infer<SpecType['get']['res'][200]['body']>
      | z.infer<SpecType['get']['res'][201]['body']>
      | z.infer<SpecType['get']['res'][404]['body']>
    >
  >;
  POST: (
    req: NextRequest,
  ) => Promise<
    NextResponse<
      | z.infer<SpecType['post']['res'][200]['body']>
    >
  >;
};

const toHandler = (controller: Controller): ResHandler => {
  return {
    GET: async (req: NextRequest) => {
      const res = await controller.get({
        headers: frourioSpec.get.headers.parse(Object.fromEntries(req.headers)),
        query: frourioSpec.get.query.parse(Object.fromEntries(req.nextUrl.searchParams)),
      });

      switch (res.status) {
        case 200:
          return NextResponse.json(frourioSpec.get.res[200].body.parse(res.body), {
            status: 200,
          });
        case 201:
          return NextResponse.json(frourioSpec.get.res[201].body.parse(res.body), {
            status: 201,
            headers: frourioSpec.get.res[201].headers.parse(res.headers),
          });
        case 404:
          return NextResponse.json(frourioSpec.get.res[404].body.parse(res.body), {
            status: 404,
          });
        default:
          throw new Error(res satisfies never);
      }
    },
    POST: async (req: NextRequest) => {
      const res = await controller.post({
        body: frourioSpec.post.body.parse(await req.json()),
      });

      switch (res.status) {
        case 200:
          return NextResponse.json(frourioSpec.post.res[200].body.parse(res.body), {
            status: 200,
          });
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
