import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { frourioSpec } from './frourio';

const paramToNum = <T extends z.ZodTypeAny>(schema: T) =>
  z.string().or(z.number()).transform<z.infer<T>>((val, ctx) => {
    const numVal = Number(val);
    const parsed = schema.safeParse(isNaN(numVal) ? val : numVal);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

export const paramsSchema = z.object({ 'id': paramToNum(frourioSpec.param) });

type ParamsType = z.infer<typeof paramsSchema>;

type SpecType = typeof frourioSpec;

type Controller = {
};

type NextParams<T extends Record<string, unknown>> = {
  [Key in keyof T]: (NonNullable<T[Key]> extends unknown[] ? string[] : string) | T[Key];
};

type MethodHandler = (req: NextRequest | Request, option: { params: Promise<NextParams<ParamsType>> }) => Promise<NextResponse>;

type ResHandler = {
};

export const createRoute = (controller: Controller): ResHandler => {
  const middleware = (next: (
    args: { req: NextRequest, params: ParamsType },
  ) => Promise<NextResponse>): MethodHandler => async (originalReq, option) => {
    const req = originalReq instanceof NextRequest ? originalReq : new NextRequest(originalReq);
    const params = paramsSchema.safeParse(await option.params);

    if (params.error) return createReqErr(params.error);


      return await next({ req, params: params.data })
      
    
  };

  return {

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
