import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import methods from './frourio';
import type { GET, POST } from './route';

type MethodChecker = [typeof GET, typeof POST];

type MethodsType = typeof methods;

type Controller = {
  get: (req: {
    headers: z.infer<MethodsType['get']['headers']>;
    query: z.infer<MethodsType['get']['query']>;
  }) => Promise<
    | {
        status: 200;
        body: z.infer<MethodsType['get']['res'][200]['body']>;
      }
    | {
        status: 201;
        headers: z.infer<MethodsType['get']['res'][201]['headers']>;
        body: z.infer<MethodsType['get']['res'][201]['body']>;
      }
    | {
        status: 404;
        body: z.infer<MethodsType['get']['res'][404]['body']>;
      }
  >;
  post: (req: {
    body: z.infer<MethodsType['post']['body']>;
  }) => Promise<
    | {
        status: 200;
        body: z.infer<MethodsType['post']['res'][200]['body']>;
      }
  >;
};

type ResHandler = {
  GET: (
    req: NextRequest,
  ) => Promise<
    NextResponse<
      | z.infer<MethodsType['get']['res'][200]['body']>
      | z.infer<MethodsType['get']['res'][201]['body']>
      | z.infer<MethodsType['get']['res'][404]['body']>
    >
  >;
  POST: (
    req: NextRequest,
  ) => Promise<
    NextResponse<
      | z.infer<MethodsType['post']['res'][200]['body']>
    >
  >;
};

const toHandler = (controller: Controller): ResHandler => {
  return {
    GET: async (req: NextRequest) => {
      const res = await controller.get({
        headers: methods.get.headers.parse(Object.fromEntries(req.headers)),
        query: methods.get.query.parse(Object.fromEntries(req.nextUrl.searchParams)),
      });

      switch (res.status) {
        case 200:
          return NextResponse.json(methods.get.res[200].body.parse(res.body), {
            status: 200,
          });
        case 201:
          return NextResponse.json(methods.get.res[201].body.parse(res.body), {
            status: 201,
            headers: methods.get.res[201].headers.parse(res.headers),
          });
        case 404:
          return NextResponse.json(methods.get.res[404].body.parse(res.body), {
            status: 404,
          });
        default:
          throw new Error(res satisfies never);
      }
    },
    POST: async (req: NextRequest) => {
      const res = await controller.post({
        body: methods.post.body.parse(await req.json()),
      });

      switch (res.status) {
        case 200:
          return NextResponse.json(methods.post.res[200].body.parse(res.body), {
            status: 200,
          });
        default:
          throw new Error(res.status satisfies never);
      }
    },
  };
};

export function defineRoute(controller: Controller): ResHandler;
export function defineRoute<T extends Record<string, unknown>>(
  deps: T,
  cb: (d: T) => Controller,
): ResHandler & { inject: (d: T) => ResHandler };
export function defineRoute<T extends Record<string, unknown>>(
  controllerOrDeps: Controller | T,
  cb?: (d: T) => Controller,
) {
  if (cb === undefined) return toHandler(controllerOrDeps as Controller);

  return { ...toHandler(cb(controllerOrDeps as T)), inject: (d: T) => toHandler(cb(d)) };
}
