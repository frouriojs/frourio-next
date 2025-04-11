import { NextRequest, NextResponse } from 'next/server';
import type { z } from 'zod';
import { frourioSpec } from './frourio';
import type { GET, POST, PATCH } from './route';

type RouteChecker = [typeof GET, typeof POST, typeof PATCH];

type SpecType = typeof frourioSpec;

type Controller = {
  get: (
    req: {
      query: z.infer<SpecType['get']['query']>;
    },
  ) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['get']['res'][200]['body']>;
      }
    | {
        status: 400;
        body: z.infer<SpecType['get']['res'][400]['body']>;
      }
  >;
  post: (
    req: {
      body: z.infer<SpecType['post']['body']>;
    },
  ) => Promise<
    | {
        status: 201;
        body: z.infer<SpecType['post']['res'][201]['body']>;
      }
    | {
        status: 400;
        body: z.infer<SpecType['post']['res'][400]['body']>;
      }
    | {
        status: 422;
        body: z.infer<SpecType['post']['res'][422]['body']>;
      }
  >;
  patch: (
    req: {
      body: z.infer<SpecType['patch']['body']>;
    },
  ) => Promise<
    | {
        status: 200;
        body: z.infer<SpecType['patch']['res'][200]['body']>;
      }
    | {
        status: 400;
        body: z.infer<SpecType['patch']['res'][400]['body']>;
      }
  >;
};

type MethodHandler = (req: NextRequest | Request) => Promise<NextResponse>;;

type ResHandler = {
  GET: MethodHandler
  POST: MethodHandler
  PATCH: MethodHandler
};

export const createRoute = (controller: Controller): ResHandler => {
  return {
    GET: async (originalReq) => {
      const req = originalReq instanceof NextRequest ? originalReq : new NextRequest(originalReq);
      const query = frourioSpec.get.query.safeParse({
        'search': req.nextUrl.searchParams.get('search') ?? undefined,
        'limit': queryToNum(req.nextUrl.searchParams.get('limit') ?? undefined),
      });

      if (query.error) return createReqErr(query.error);

      const res = await controller.get({ query: query.data });

      switch (res.status) {
        case 200: {
          const body = frourioSpec.get.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        case 400: {
          const body = frourioSpec.get.res[400].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 400 });
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
          const body = frourioSpec.post.res[201].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 201 });
        }
        case 400: {
          const body = frourioSpec.post.res[400].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 400 });
        }
        case 422: {
          const body = frourioSpec.post.res[422].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 422 });
        }
        default:
          throw new Error(res satisfies never);
      }
    },
    PATCH: async (req) => {
      const formData = await req.formData();
      const body = frourioSpec.patch.body.safeParse(
        Object.fromEntries(
          [
            ['userId', formData.get('userId') ?? undefined],
            ['avatar', formData.get('avatar') ?? undefined],
            ['metadata', formData.get('metadata') ?? undefined],
          ].filter(entry => entry[1] !== undefined),
        ),
      );

      if (body.error) return createReqErr(body.error);

      const res = await controller.patch({ body: body.data });

      switch (res.status) {
        case 200: {
          const body = frourioSpec.patch.res[200].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 200 });
        }
        case 400: {
          const body = frourioSpec.patch.res[400].body.safeParse(res.body);

          if (body.error) return createResErr();

          return createResponse(body.data, { status: 400 });
        }
        default:
          throw new Error(res satisfies never);
      }
    },
  };
};

const createResponse = (body: unknown, init: ResponseInit): NextResponse => {
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
