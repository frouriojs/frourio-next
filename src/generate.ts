import { writeFile } from 'fs/promises';
import path from 'path';
import ts from 'typescript';
import { CLIENT_FILE, FROURIO_FILE, SERVER_FILE } from './constants';
import { getPropOptions, getSchemaOption, inferZodType, type PropOption } from './getPropOptions';
import { initTSC } from './initTSC';
import { listFrourioDirs } from './listFrourioDirs';
import type { ClientParamsInfo, ParamsInfo } from './paramsUtil';
import { clientParamsToText, paramsToText, pathToClientParams, pathToParams } from './paramsUtil';
import {
  formDataToBoolArrText,
  formDataToBoolText,
  formDataToNumArrText,
  formDataToNumText,
  paramToNumArrText,
  paramToNumText,
  queryToBoolArrText,
  queryToBoolText,
  queryToNumArrText,
  queryToNumText,
} from './serverDataChunks';
import { writeDefaults } from './writeDefaults';

type ServerMethod = {
  name: string;
  hasHeaders: boolean;
  query: PropOption[] | null;
  body:
    | { isFormData: true; data: PropOption[] | null }
    | { isFormData: false; data?: undefined }
    | null;
  res: { status: string; hasHeaders: boolean; body: { isFormData: boolean } | null }[] | undefined;
};

export const generate = async (appDir: string): Promise<void> => {
  const frourioDirs = listFrourioDirs(appDir);

  await writeDefaults(frourioDirs);

  const { program, checker } = initTSC(frourioDirs);
  const hasParamDict: Record<string, boolean> = {};
  const middlewareDict: Record<string, { hasCtx: boolean } | undefined> = {};
  const data = frourioDirs
    .map((dirPath) => {
      const source = program.getSourceFile(path.posix.join(dirPath, FROURIO_FILE));
      const spec = source?.forEachChild((node) => {
        if (!ts.isVariableStatement(node)) return;

        const decl = node.declarationList.declarations.find(
          (d) => d.name.getText() === 'frourioSpec',
        );

        if (!decl?.initializer) return;

        const specProps = checker.getTypeAtLocation(decl.initializer).getProperties();
        const paramSymbol = specProps.find((t) => t.getName() === 'param');
        const paramZodType = paramSymbol ? inferZodType(checker, paramSymbol) : null;

        hasParamDict[dirPath] = !!paramSymbol;

        const middlewareSymbol = specProps.find((t) => t.getName() === 'middleware');
        const middlewareType =
          middlewareSymbol?.valueDeclaration &&
          checker.getTypeOfSymbolAtLocation(middlewareSymbol, middlewareSymbol.valueDeclaration);

        middlewareDict[dirPath] = middlewareType && {
          hasCtx: checker.typeToString(middlewareType) !== 'true',
        };

        return {
          param: paramZodType ? getSchemaOption(checker, paramZodType) : null,
          methods: specProps
            .map((t): ServerMethod | null => {
              if (t.getName() === 'param' || t.getName() === 'middleware') return null;

              const type =
                t.valueDeclaration && checker.getTypeOfSymbolAtLocation(t, t.valueDeclaration);

              if (!type) return null;

              const props = type.getProperties();
              const querySymbol = props.find((p) => p.getName() === 'query');
              const queryZodType = querySymbol ? inferZodType(checker, querySymbol) : null;
              const bodySymbol = props.find((p) => p.getName() === 'body');
              const bodyZodType = bodySymbol ? inferZodType(checker, bodySymbol) : null;
              const res = props.find((p) => p.getName() === 'res');
              const resType =
                res?.valueDeclaration &&
                checker.getTypeOfSymbolAtLocation(res, res.valueDeclaration);

              return {
                name: t.getName(),
                hasHeaders: props.some((p) => p.getName() === 'headers'),
                query: queryZodType ? getPropOptions(checker, queryZodType) : null,
                body: props.some((p) => p.getName() === 'body')
                  ? props.some((p) => p.getName() === 'format') && bodyZodType
                    ? { isFormData: true, data: getPropOptions(checker, bodyZodType) }
                    : { isFormData: false }
                  : null,
                res: resType
                  ?.getProperties()
                  .map((s) => {
                    const statusType =
                      s.valueDeclaration &&
                      checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration);

                    if (!statusType) return null;

                    const statusProps = statusType.getProperties();
                    const body = statusProps.find((p) => p.getName() === 'body');

                    return {
                      status: s.getName(),
                      hasHeaders: statusProps.some((p) => p.getName() === 'headers'),
                      body: body
                        ? { isFormData: statusProps.some((p) => p.getName() === 'format') }
                        : null,
                    };
                  })
                  .filter((s) => s !== null),
              };
            })
            .filter((n) => n !== null),
        };
      });

      const ancestorMiddleware = frourioDirs.findLast(
        (dir) => dir !== dirPath && dirPath.includes(dir) && middlewareDict[dir],
      );

      const ancestorMiddlewareCtx = frourioDirs.findLast(
        (dir) => dir !== dirPath && dirPath.includes(dir) && middlewareDict[dir]?.hasCtx,
      );

      return (
        spec && {
          server: {
            filePath: path.posix.join(dirPath, SERVER_FILE),
            text: serverData(
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
          },
          client: {
            filePath: path.posix.join(dirPath, CLIENT_FILE),
            text: clientData(
              dirPath.replace(appDir, ''),
              pathToClientParams(hasParamDict, dirPath, spec.param),
              spec.methods,
            ),
          },
        }
      );
    })
    .filter((d) => d !== undefined);

  await Promise.all(
    data.flatMap((d) => [
      writeFile(d.server.filePath, d.server.text, 'utf8'),
      writeFile(d.client.filePath, d.client.text, 'utf8'),
    ]),
  );
};

const clientData = (
  apiPath: string,
  params: ClientParamsInfo | undefined,
  methods: ServerMethod[],
) => {
  const imports: string[] = [
    `import { z } from 'zod'`,
    ...(params?.ancestors.map(
      ({ path }, n) => `import { frourioSpec as ancestorSpec${n} } from '${path}'`,
    ) ?? []),
    "import { frourioSpec } from './frourio'",
  ];

  return `${imports.join(';\n')}
${params ? `\nconst paramsSchema = ${clientParamsToText(params)};\n` : ''}
const $path = {${methods
    .map(
      (
        method,
      ) => `\n  ${method.name}(req: { ${[...(params ? ['params: z.infer<typeof paramsSchema>'] : []), ...(method.query ? [`query: z.infer<typeof frourioSpec.${method.name}.query>`] : [])].join(',')} }) {
${
  params
    ? `    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return;\n\n`
    : ''
}${
        method.query
          ? `    const parsedQuery = frourioSpec.${method.name}.query.safeParse(req.query);

    if (!parsedQuery.success) return;

    const searchParams = new URLSearchParams();

    Object.entries(parsedQuery.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    });\n\n`
          : ''
      }    return \`${
        params
          ? apiPath
              .replace(/\/\(.+?\)/g, '')
              .replace(
                /\/\[\[\.\.\.(.+?)\]\]/,
                "${parsedParams.data.$1 !== undefined && parsedParams.data.$1.length > 0 ? `/${parsedParams.data.$1.join('/')}` : ''}",
              )
              .replace(/\[\.\.\.(.+?)\]/, "${parsedParams.data.$1.join('/')}")
              .replace(/\[(.+?)\]/g, '${parsedParams.data.$1}')
          : apiPath.replace(/\/\(.+?\)/g, '')
      }${method.query ? `?\${searchParams.toString()}` : ''}\`;
  },`,
    )
    .join('')}
};

export const fc = {
  ${methods
    .map(
      (method) => `async $${method.name}(req: { ${[
        ...(params ? ['params: z.infer<typeof paramsSchema>'] : []),
        ...(method.hasHeaders
          ? [`headers: z.infer<typeof frourioSpec.${method.name}.headers>`]
          : []),
        ...(method.query ? [`query: z.infer<typeof frourioSpec.${method.name}.query>`] : []),
        ...(method.body ? [`body: z.infer<typeof frourioSpec.${method.name}.body>`] : []),
        'init?: RequestInit',
      ].join(', ')} }) {
    const url = $path.${method.name}(req);

    if (!url) return;
${
  method.hasHeaders
    ? `\n    const parsedHeaders = frourioSpec.${method.name}.headers.safeParse(req.headers);

    if (!parsedHeaders.success) return;\n`
    : ''
}${
        method.body
          ? `\n    const parsedBody = frourioSpec.${method.name}.body.safeParse(req.body);

    if (!parsedBody.success) return;\n`
          : ''
      }${
        method.body?.isFormData
          ? `\n    const formData = new FormData();

    Object.entries(parsedBody.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach((item) =>
          item instanceof File
            ? formData.append(key, item, item.name)
            : formData.append(key, item.toString()),
        );
      } else if (value instanceof File) {
        formData.set(key, value, value.name);
      } else {
        formData.set(key, value.toString());
      }
    });\n`
          : ''
      }
    const res = await fetch(
      url,
      {
        method: '${method.name.toUpperCase()}',${
          method.body || method.hasHeaders
            ? `\n        headers: { ${
                method.body?.isFormData
                  ? "'content-type': 'multipart/form-data',"
                  : method.body
                    ? "'content-type': 'application/json',"
                    : ''
              }${method.hasHeaders ? ' ...parsedHeaders.data as HeadersInit' : ''} },`
            : ''
        }${
          method.body?.isFormData
            ? '\n        body: formData,'
            : method.body
              ? '\n        body: JSON.stringify(parsedBody.data),'
              : ''
        }
        ...req.init,
      }
    );
  },`,
    )
    .join('\n  ')}
  $path,
};
`;
};

const serverData = (
  params: ParamsInfo | undefined,
  middleware: {
    ancestor: string | undefined;
    ancestorCtx: string | undefined;
    current: { hasCtx: boolean } | undefined;
  },
  methods: ServerMethod[],
) => {
  const imports: string[] = [
    "import type { NextRequest } from 'next/server'",
    "import { NextResponse } from 'next/server'",
    `import ${params ? '' : 'type '}{ z } from 'zod'`,
    params?.ancestorFrourio &&
      `import { paramsSchema as ancestorParamsSchema } from '${params.ancestorFrourio}'`,
    middleware.ancestor &&
      `import { middleware as ancestorMiddleweare } from '${middleware.ancestor}/route'`,
    middleware.ancestorCtx &&
      `import { contextSchema as ancestorContextSchema${middleware.current ? ', type ContextType as AncestorContextType' : ''} } from '${middleware.ancestorCtx}/${SERVER_FILE.replace('.ts', '')}'`,
    "import { frourioSpec } from './frourio'",
    `import type { ${[...methods.map((m) => m.name.toUpperCase()), ...(middleware.current ? ['middleware'] : [])].join(', ')} } from './route'`,
  ].filter((txt) => txt !== undefined);

  const chunks: string[] = [
    `type RouteChecker = [${[...methods.map((m) => `typeof ${m.name.toUpperCase()}`), ...(middleware.current ? ['typeof middleware'] : [])].join(', ')}]`,
    params &&
      `${params.current ? `${params.current.param?.typeName !== 'number' ? '' : params.current.param.isArray ? paramToNumArrText : paramToNumText}` : ''}export const paramsSchema = ${paramsToText(params)};\n\ntype ParamsType = z.infer<typeof paramsSchema>`,
    'type SpecType = typeof frourioSpec',
    middleware.current?.hasCtx
      ? `export const contextSchema = frourioSpec.middleware.context${middleware.ancestorCtx ? '.and(ancestorContextSchema)' : ''};\n\nexport type ContextType = z.infer<typeof contextSchema>`
      : middleware.ancestorCtx &&
        'const contextSchema = ancestorContextSchema;\n\ntype ContextType = z.infer<typeof contextSchema>',
    middleware.current &&
      `type Middleware = (
  args: {
    req: NextRequest,${params ? '\n    params: ParamsType,' : ''}
    next: (req: NextRequest${middleware.current.hasCtx ? ', ctx: z.infer<typeof frourioSpec.middleware.context>' : ''}) => Promise<Response>,
  },${middleware.ancestorCtx ? '\n  ctx: AncestorContextType,' : ''}
) => Promise<Response>`,
    `type Controller = {${middleware.current ? '\n  middleware: Middleware;' : ''}
${methods
  .map(
    (m) =>
      `  ${m.name}: (
    req: {${params ? '\n      params: ParamsType;' : ''}${m.hasHeaders ? `\n      headers: z.infer<SpecType['${m.name}']['headers']>;` : ''}${m.query ? `\n      query: z.infer<SpecType['${m.name}']['query']>;` : ''}${m.body ? `\n      body: z.infer<SpecType['${m.name}']['body']>;` : ''}
    },${middleware.ancestorCtx || middleware.current?.hasCtx ? '\n    ctx: ContextType,' : ''}
  ) => Promise<${
    m.res
      ? `\n${m.res
          .map(
            (r) =>
              `    | {
        status: ${r.status};${r.hasHeaders ? `\n        headers: z.infer<SpecType['${m.name}']['res'][${r.status}]['headers']>;` : ''}${r.body ? `\n        body: z.infer<SpecType['${m.name}']['res'][${r.status}]['body']>;` : ''}
      }`,
          )
          .join('\n')}\n  `
      : 'Response'
  }>;`,
  )
  .join('\n')}
}`,
    `type ResHandler = {${
      middleware.current
        ? `\n  middleware: (next: (
    args: { req: NextRequest${params ? ', params: ParamsType' : ''} },${middleware.ancestorCtx || middleware.current.hasCtx ? '\n    ctx: ContextType,' : ''}
  ) => Promise<Response>) => (originalReq: NextRequest, option: {${params ? `params: Promise<ParamsType>` : ''}}) => Promise<Response>;`
        : ''
    }
${methods
  .map(
    (m) =>
      `  ${m.name.toUpperCase()}: (req: NextRequest, option: {${params ? ' params: Promise<ParamsType> ' : ''}}) => Promise<Response>;`,
  )
  .join('\n')}
}`,
    `export const createRoute = (controller: Controller): ResHandler => {
${
  middleware.ancestor || middleware.current || params
    ? `  const middleware = (next: (
    args: { req: NextRequest${params ? ', params: ParamsType' : ''} },${middleware.ancestorCtx || middleware.current?.hasCtx ? '\n    ctx: ContextType,' : ''}
  ) => Promise<Response>) => async (originalReq: NextRequest, option: {${params ? ' params: Promise<ParamsType> ' : ''}}): Promise<Response> => {
${
  params
    ? `    const params = paramsSchema.safeParse(await option.params);

    if (params.error) return createReqErr(params.error);\n`
    : ''
}
    ${
      middleware.ancestor
        ? `return ancestorMiddleweare(async (ancestorArgs${middleware.ancestorCtx ? ', ancestorContext' : ''}) => {
${
  middleware.ancestorCtx
    ? `      const ancestorCtx = ancestorContextSchema.safeParse(ancestorContext);

      if (ancestorCtx.error) return createReqErr(ancestorCtx.error);`
    : ''
}`
        : ''
    }
    ${
      middleware.current
        ? `return await controller.middleware(
      {
        req: ${middleware.ancestor ? 'ancestorArgs.req' : 'originalReq'},${params ? '\n        params: params.data,' : ''}
        next: async (req${middleware.ancestorCtx || middleware.current.hasCtx ? ', context' : ''}) => {
${
  middleware.current.hasCtx
    ? `      const ctx = frourioSpec.middleware.context.safeParse(context);

      if (ctx.error) return createReqErr(ctx.error);`
    : ''
}`
        : ''
    }

      return await next({ req${
        middleware.current ? '' : middleware.ancestor ? ': ancestorArgs.req' : ': originalReq'
      }${params ? ', params: params.data' : ''} }${
        middleware.ancestorCtx || middleware.current?.hasCtx
          ? `, { ${middleware.ancestorCtx ? '...ancestorCtx.data,' : ''}${
              middleware.current?.hasCtx ? '...ctx.data' : ''
            } }`
          : ''
      })
      ${middleware.current ? `},\n      },${middleware.ancestorCtx ? '\n      ancestorCtx.data,' : ''}\n    )` : ''}
    ${middleware.ancestor ? '})(originalReq, option)' : ''}
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
    const wrapped = `${d.typeName === 'string' || d.typeName === 'File' ? '' : `formDataTo${d.typeName === 'number' ? 'Num' : 'Bool'}${d.isArray ? 'Arr' : ''}(`}${fn}${d.typeName === 'string' || d.typeName === 'File' ? '' : ')'}`;

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
        ? `middleware(async ({ req${params ? ', params' : ''} }${
            middleware.ancestorCtx || middleware.current?.hasCtx ? ', ctx' : ''
          }`
        : 'async (req'
    }) => {${m.body?.isFormData ? '\n      const formData = await req.formData();' : ''}${requests.map((r) => `\n      const ${r[0]} = ${r[1]};\n\n      if (${r[0]}.error) return createReqErr(${r[0]}.error);\n`).join('')}
      const res = await controller.${m.name}({ ${[...requests.map((r) => `${r[0]}: ${r[0]}.data`), ...(params ? ['params'] : [])].join(', ')} }${middleware.ancestorCtx || middleware.current?.hasCtx ? ', ctx' : ''});

      ${
        m.res
          ? `switch (res.status) {
${m.res
  .map((r) => {
    const resTypes = [r.hasHeaders && 'headers', r.body && 'body'].filter((r) => !!r);

    return `        case ${r.status}: {${resTypes.map((t) => `\n          const ${t} = frourioSpec.${m.name}.res[${r.status}].${t}.safeParse(res.${t});\n\n          if (${t}.error) return createResErr();\n`).join('')}
          return ${!r.body ? `new Response(null` : r.body.isFormData ? 'createFormDataResponse(body.data' : 'createResponse(body.data'}, { status: ${r.status}${r.hasHeaders ? ', headers: headers.data' : ''} });
        }`;
  })
  .join('\n')}
        default:
          throw new Error(res${m.res.length <= 1 ? '.status' : ''} satisfies never);
      }`
          : 'return res;'
      }
    }${params || middleware.ancestor || middleware.current ? ')' : ''},`;
  })
  .join('\n')}
  };
}`,
    methods.some((m) => m.res?.some((r) => r.body && !r.body.isFormData)) &&
      `const createResponse = (body: unknown, init: ResponseInit): Response => {
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
    methods.some((m) => m.res?.some((r) => r.body?.isFormData)) &&
      `const createFormDataResponse = (
  body: Record<
    string,
    ((string | number | boolean | File)[] | string | number | boolean | File) | undefined
  >,
  init: ResponseInit,
) => {
  const formData = new FormData();

  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) =>
        item instanceof File
          ? formData.append(key, item, item.name)
          : formData.append(key, item.toString()),
      );
    } else if (value instanceof File) {
      formData.set(key, value, value.name);
    } else {
      formData.set(key, value.toString());
    }
  });

  return new NextResponse(formData, init);
}`,
  ].filter((txt) => txt !== undefined && txt !== false);

  const suffixes: string[] = [
    methods.some((m) => m.query?.some((q) => q.typeName === 'number' && !q.isArray)) &&
      queryToNumText,
    methods.some((m) => m.query?.some((q) => q.typeName === 'number' && q.isArray)) &&
      queryToNumArrText,
    methods.some((m) => m.query?.some((q) => q.typeName === 'boolean' && !q.isArray)) &&
      queryToBoolText,
    methods.some((m) => m.query?.some((q) => q.typeName === 'boolean' && q.isArray)) &&
      queryToBoolArrText,
    methods.some((m) => m.body?.data?.some((b) => b.typeName === 'number' && !b.isArray)) &&
      formDataToNumText,
    methods.some((m) => m.body?.data?.some((b) => b.typeName === 'number' && b.isArray)) &&
      formDataToNumArrText,
    methods.some((m) => m.body?.data?.some((b) => b.typeName === 'boolean' && !b.isArray)) &&
      formDataToBoolText,
    methods.some((m) => m.body?.data?.some((b) => b.typeName === 'boolean' && b.isArray)) &&
      formDataToBoolArrText,
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
