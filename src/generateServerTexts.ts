import path from 'path';
import { SERVER_FILE } from './constants';
import type { DirSpec, MethodInfo, MiddlewareDict } from './generate';
import type { ParamsInfo } from './paramsUtil';
import { paramsToText, pathToParams } from './paramsUtil';

export const generateServerTexts = (
  specs: DirSpec[],
  frourioDirs: string[],
  middlewareDict: MiddlewareDict,
) =>
  specs.map(({ dirPath, spec }) => {
    const ancestorMiddleware = frourioDirs.findLast(
      (dir) => dir !== dirPath && dirPath.includes(dir) && middlewareDict[dir],
    );
    const ancestorMiddlewareCtx = frourioDirs.findLast(
      (dir) => dir !== dirPath && dirPath.includes(dir) && middlewareDict[dir]?.hasCtx,
    );

    return {
      filePath: path.posix.join(dirPath, SERVER_FILE),
      text: generateServer(
        pathToParams(frourioDirs, dirPath, spec.param),
        {
          ancestor: ancestorMiddleware
            ? path.posix.relative(dirPath, ancestorMiddleware)
            : undefined,
          ancestorCtx: ancestorMiddlewareCtx
            ? path.posix.relative(dirPath, ancestorMiddlewareCtx)
            : undefined,
          current: middlewareDict[dirPath],
        },
        spec.methods,
      ),
    };
  });

const generateServer = (
  params: ParamsInfo | undefined,
  middleware: {
    ancestor: string | undefined;
    ancestorCtx: string | undefined;
    current: { hasCtx: boolean } | undefined;
  },
  methods: MethodInfo[],
) => {
  const needsRouteFile = methods.length > 0 || middleware.current;
  const imports: string[] = [
    "import { NextRequest, NextResponse } from 'next/server'",
    `import ${params ? '' : 'type '}{ z } from 'zod'`,
    params?.ancestorFrourio &&
      `import { paramsSchema as ancestorParamsSchema } from '${params.ancestorFrourio}'`,
    middleware.ancestor &&
      `import { middleware as ancestorMiddleware } from '${middleware.ancestor}/route'`,
    middleware.ancestorCtx &&
      `import { contextSchema as ancestorContextSchema${middleware.current ? ', type ContextType as AncestorContextType' : ''} } from '${middleware.ancestorCtx}/${SERVER_FILE.replace('.ts', '')}'`,
    "import { frourioSpec } from './frourio'",
    needsRouteFile &&
      `import type { ${[...methods.map((m) => m.name.toUpperCase()), ...(middleware.current ? ['middleware'] : [])].join(', ')} } from './route'`,
  ].filter((txt) => txt !== undefined);

  const chunks: string[] = [
    needsRouteFile &&
      `type RouteChecker = [${[...methods.map((m) => `typeof ${m.name.toUpperCase()}`), ...(middleware.current ? ['typeof middleware'] : [])].join(', ')}]`,
    params &&
      `${
        params.current
          ? `${
              params.current.param?.typeName !== 'number'
                ? ''
                : params.current.param.isArray
                  ? paramToNumArrText
                  : paramToNumText
            }`
          : ''
      }export const paramsSchema = ${paramsToText(params)};\n\ntype ParamsType = z.infer<typeof paramsSchema>`,
    'type SpecType = typeof frourioSpec',
    middleware.current?.hasCtx
      ? `export const contextSchema = frourioSpec.middleware.context${middleware.ancestorCtx ? '.and(ancestorContextSchema)' : ''};\n\nexport type ContextType = z.infer<typeof contextSchema>`
      : middleware.ancestorCtx &&
        'const contextSchema = ancestorContextSchema;\n\ntype ContextType = z.infer<typeof contextSchema>',
    middleware.current &&
      `type Middleware = (
  args: {
    req: NextRequest,${params ? '\n    params: ParamsType,' : ''}
    next: (${middleware.current.hasCtx ? 'ctx: z.infer<typeof frourioSpec.middleware.context>' : ''}) => Promise<NextResponse>,
  },${middleware.ancestorCtx ? '\n  ctx: AncestorContextType,' : ''}
) => Promise<NextResponse>`,
    `type Controller = {${middleware.current ? '\n  middleware: Middleware;' : ''}${methods
      .map(
        (m) =>
          `\n  ${m.name}: (
    req: {${params ? '\n      params: ParamsType;' : ''}${
      m.hasHeaders ? `\n      headers: z.infer<SpecType['${m.name}']['headers']>;` : ''
    }${m.query ? `\n      query: z.infer<SpecType['${m.name}']['query']>;` : ''}${
      m.body ? `\n      body: z.infer<SpecType['${m.name}']['body']>;` : ''
    }
    },${middleware.ancestorCtx || middleware.current?.hasCtx ? '\n    ctx: ContextType,' : ''}
  ) => Promise<${
    m.res
      ? `\n${m.res
          .map(
            (r) =>
              `    | {
        status: ${r.status};${
          r.hasHeaders
            ? `\n        headers: z.infer<SpecType['${m.name}']['res'][${r.status}]['headers']>;`
            : ''
        }${r.body ? `\n        body: z.infer<SpecType['${m.name}']['res'][${r.status}]['body']>;` : ''}
      }`,
          )
          .join('\n')}\n  `
      : 'NextResponse | Response'
  }>;`,
      )
      .join('')}
}`,
    params &&
      `type NextParams<T extends Record<string, unknown>> = {
  [Key in keyof T]: (NonNullable<T[Key]> extends unknown[] ? string[] : string) | T[Key];
}`,
    `type MethodHandler = (req: NextRequest | Request${params ? ', option: { params: Promise<NextParams<ParamsType>> }' : ''}) => Promise<NextResponse>`,
    `type ResHandler = {${
      middleware.current
        ? `\n  middleware: (
    next: (args: { req: NextRequest${params ? ', params: ParamsType' : ''} }${middleware.ancestorCtx || middleware.current.hasCtx ? ', ctx: ContextType' : ''}) => Promise<NextResponse>,
  ) => (req: NextRequest, option${params ? ': { params: Promise<NextParams<ParamsType>> }' : '?: {}'}) => Promise<NextResponse>;`
        : ''
    }${methods.map((m) => `\n  ${m.name.toUpperCase()}: MethodHandler`).join('')}
}`,
    `export const createRoute = (controller: Controller): ResHandler => {
${
  middleware.ancestor || middleware.current || params
    ? `  const middleware = (next: (
    args: { req: NextRequest${params ? ', params: ParamsType' : ''} },${middleware.ancestorCtx || middleware.current?.hasCtx ? '\n    ctx: ContextType,' : ''}
  ) => Promise<NextResponse>): MethodHandler => async (originalReq${params ? ', option' : ''}) => {
    const req = originalReq instanceof NextRequest ? originalReq : new NextRequest(originalReq);${
      params
        ? `\n    const params = paramsSchema.safeParse(await option.params);

    if (params.error) return createReqErr(params.error);\n`
        : ''
    }${
      middleware.ancestor
        ? `\n    return ancestorMiddleware(async (${middleware.ancestorCtx ? '_, ancestorContext' : ''}) => {${
            middleware.ancestorCtx
              ? `\n      const ancestorCtx = ancestorContextSchema.safeParse(ancestorContext);

      if (ancestorCtx.error) return createReqErr(ancestorCtx.error);\n`
              : ''
          }`
        : ''
    }${
      middleware.current
        ? `\n    return await controller.middleware(
      {
        req,${params ? '\n        params: params.data,' : ''}
        next: async (${middleware.current.hasCtx ? ' context' : ''}) => {
${
  middleware.current.hasCtx
    ? `      const ctx = frourioSpec.middleware.context.safeParse(context);

      if (ctx.error) return createReqErr(ctx.error);`
    : ''
}`
        : ''
    }

      return await next({ req${params ? ', params: params.data' : ''} }${
        middleware.ancestorCtx || middleware.current?.hasCtx
          ? `, { ${middleware.ancestorCtx ? '...ancestorCtx.data,' : ''}${
              middleware.current?.hasCtx ? '...ctx.data' : ''
            } }`
          : ''
      })
      ${middleware.current ? `},\n      },${middleware.ancestorCtx ? '\n      ancestorCtx.data,' : ''}\n    )` : ''}
    ${middleware.ancestor ? `})(req${params?.ancestorFrourio ? ', option' : ''})` : ''}
  };

`
    : ''
}  return {${middleware.current ? '\n    middleware,' : ''}
${methods
  .map((m) => {
    const requests = [
      m.hasHeaders && [
        'headers',
        `frourioSpec.${m.name}.headers.safeParse(Object.fromEntries(req.headers))`,
      ],
      m.query && [
        'query',
        `frourioSpec.${m.name}.query.safeParse({
${m.query
  .map((p) => {
    const fn = `req.nextUrl.searchParams.get${p.isArray ? 'All' : ''}('${p.name}')${p.isArray ? '' : ' ?? undefined'}`;
    const wrapped = `${p.typeName === 'string' ? '' : `queryTo${p.typeName === 'number' ? 'Num' : 'Bool'}${p.isArray ? 'Arr' : ''}(`}${fn}${p.typeName === 'string' ? '' : ')'}`;

    return `        '${p.name}': ${p.isArray && p.isOptional ? `${fn}.length > 0 ? ${wrapped} : undefined` : wrapped},`;
  })
  .join('\n')}
      })`,
      ],
      m.body && [
        'body',
        `frourioSpec.${m.name}.body.safeParse(${
          m.body.data
            ? `
        Object.fromEntries(
          [
${m.body.data
  .map((d) => {
    const fn = `formData.get${d.isArray ? 'All' : ''}('${d.name}')${d.isArray ? '' : ' ?? undefined'}`;
    const wrapped = `${
      d.typeName === 'string'
        ? ''
        : `${d.typeName === 'File' ? 'await ' : ''}formDataTo${d.typeName === 'File' ? 'File' : d.typeName === 'number' ? 'Num' : 'Bool'}${d.isArray ? 'Arr' : ''}(`
    }${fn}${d.typeName === 'string' ? '' : ')'}`;

    return `            ['${d.name}', ${d.isArray && d.isOptional ? `${fn}.length > 0 ? ${wrapped} : undefined` : wrapped}],`;
  })
  .join('\n')}
          ].filter(entry => entry[1] !== undefined),
        ),\n      `
            : 'await req.json().catch(() => undefined)'
        })`,
      ],
    ].filter((r) => !!r);

    return `    ${m.name.toUpperCase()}: ${
      params || middleware.ancestor || middleware.current
        ? `middleware(async ({ req${params ? ', params' : ''} }${middleware.ancestorCtx || middleware.current?.hasCtx ? ', ctx' : ''}) => {`
        : m.query
          ? 'async (originalReq) => {\n      const req = originalReq instanceof NextRequest ? originalReq : new NextRequest(originalReq);'
          : 'async (req) => {'
    }${m.body?.isFormData ? '\n      const formData = await req.formData();' : ''}${requests
      .map(
        (r) =>
          `\n      const ${r[0]} = ${r[1]};\n\n      if (${r[0]}.error) return createReqErr(${r[0]}.error);\n`,
      )
      .join('')}
      const res = await controller.${m.name}({ ${[
        ...requests.map((r) => `${r[0]}: ${r[0]}.data`),
        ...(params ? ['params'] : []),
      ].join(', ')} }${middleware.ancestorCtx || middleware.current?.hasCtx ? ', ctx' : ''});

      ${
        m.res
          ? `switch (res.status) {
${m.res
  .map((r) => {
    const resTypes = [r.hasHeaders && 'headers', r.body && 'body'].filter((r) => !!r);

    return `        case ${r.status}: {${resTypes
      .map(
        (t) =>
          `\n          const ${t} = frourioSpec.${m.name}.res[${r.status}].${t}.safeParse(res.${t});\n\n          if (${t}.error) return createResErr();\n`,
      )
      .join('')}
          return ${
            r.body ? 'createResponse(body.data' : `new NextResponse(null`
          }, { status: ${r.status}${r.hasHeaders ? ', headers: headers.data' : ''} });
        }`;
  })
  .join('\n')}
        default:
          throw new Error(res${m.res.length <= 1 ? '.status' : ''} satisfies never);
      }`
          : 'return res instanceof NextResponse ? res : new NextResponse(res.body, res);'
      }
    }${params || middleware.ancestor || middleware.current ? ')' : ''},`;
  })
  .join('\n')}
  };
}`,
    methods.some((m) => m.res?.some((r) => r.body)) &&
      `const createResponse = (body: unknown, init: ResponseInit): NextResponse => {
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
}`,
  ].filter((txt) => txt !== undefined && txt !== false);

  const suffixes: string[] = [
    methods.some((m) => m.query?.some((q) => q.typeName === 'number')) && queryToNumText,
    methods.some((m) => m.query?.some((q) => q.typeName === 'number' && q.isArray)) &&
      queryToNumArrText,
    methods.some((m) => m.query?.some((q) => q.typeName === 'boolean')) && queryToBoolText,
    methods.some((m) => m.query?.some((q) => q.typeName === 'boolean' && q.isArray)) &&
      queryToBoolArrText,
    methods.some((m) => m.body?.isFormData && m.body.data?.some((b) => b.typeName === 'number')) &&
      formDataToNumText,
    methods.some(
      (m) => m.body?.isFormData && m.body.data?.some((b) => b.typeName === 'number' && b.isArray),
    ) && formDataToNumArrText,
    methods.some((m) => m.body?.isFormData && m.body.data?.some((b) => b.typeName === 'boolean')) &&
      formDataToBoolText,
    methods.some(
      (m) => m.body?.isFormData && m.body.data?.some((b) => b.typeName === 'boolean' && b.isArray),
    ) && formDataToBoolArrText,
    methods.some((m) => m.body?.isFormData && m.body.data?.some((b) => b.typeName === 'File')) &&
      formDataToFileText,
    methods.some(
      (m) => m.body?.isFormData && m.body.data?.some((b) => b.typeName === 'File' && b.isArray),
    ) && formDataToFileArrText,
  ].filter((txt) => txt !== undefined && txt !== false);

  return `${imports.join(';\n')};

${chunks.join(';\n\n')};

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
${suffixes.length > 0 ? `\n${suffixes.join(';\n\n')};\n` : ''}`;
};

const paramToNumText = `const paramToNum = <T extends z.ZodTypeAny>(schema: T) =>
  z.string().or(z.number()).transform<z.infer<T>>((val, ctx) => {
    const numVal = Number(val);
    const parsed = schema.safeParse(isNaN(numVal) ? val : numVal);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

`;

const paramToNumArrText = `const paramToNumArr = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(z.string().or(z.number())).optional().transform<z.infer<T>>((val, ctx) => {
    const numArr = val?.map((v) => {
      const numVal = Number(v);

      return isNaN(numVal) ? v : numVal;
    });
    const parsed = schema.safeParse(numArr);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

`;

const queryToNumText = `const queryToNum = (val: string | undefined) => {
  const num = Number(val);

  return isNaN(num) ? val : num;
}`;

const queryToNumArrText = 'const queryToNumArr = (val: string[]) => val.map(queryToNum)';

const queryToBoolText = `const queryToBool = (val: string | undefined) =>
  val === 'true' ? true : val === 'false' ? false : val`;

const queryToBoolArrText = 'const queryToBoolArr = (val: string[]) => val.map(queryToBool)';

const formDataToNumText = `const formDataToNum = (val: FormDataEntryValue | undefined) => {
  const num = Number(val);

  return isNaN(num) ? val : num;
}`;

const formDataToNumArrText =
  'const formDataToNumArr = (val: FormDataEntryValue[]) => val.map(formDataToNum)';

const formDataToBoolText = `const formDataToBool = (val: FormDataEntryValue | undefined) =>
  val === 'true' ? true : val === 'false' ? false : val`;

const formDataToBoolArrText =
  'const formDataToBoolArr = (val: FormDataEntryValue[]) => val.map(formDataToBool)';

const formDataToFileText = `const formDataToFile = async (val: FormDataEntryValue | undefined) => {
  if (val instanceof File || typeof val === 'string' || val === undefined) return val;

  const buffer = await (val as File).arrayBuffer();

  return new File([buffer], (val as File).name, val); // for jsdom
}`;

const formDataToFileArrText =
  'const formDataToFileArr = (vals: FormDataEntryValue[]) => Promise.all(vals.map(formDataToFile))';
