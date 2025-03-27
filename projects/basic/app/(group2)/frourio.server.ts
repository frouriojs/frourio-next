import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { frourioSpec } from './frourio';
import type { middleware } from './route';

type RouteChecker = [typeof middleware];

type SpecType = typeof frourioSpec;


type Middleware = (
  req: NextRequest,
  ctx: {},
  next: (
    req: NextRequest,
  ) => Promise<Response>,
) => Promise<Response>;

type Controller = {
  middleware: Middleware;

};

type ResHandler = {
  middleware: (next: (req: NextRequest) => Promise<Response>) => (originalReq: NextRequest, originalCtx: {}) => Promise<Response>;

};

const toHandler = (controller: Controller): ResHandler => {
  const middleware = (next: (
    req: NextRequest,
  ) => Promise<Response>) => async (originalReq: NextRequest, originalCtx: {}): Promise<Response> => {

    
    return await controller.middleware(originalReq, { }, async (req) => {


      return await next(req)
       })
    
  };

  return {
    middleware,

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
