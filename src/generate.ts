import assert from 'assert';
import { writeFile } from 'fs/promises';
import path from 'path';
import ts from 'typescript';
import { FROURIO_FILE, SERVER_FILE } from './constants';
import {
  getPropOptions,
  getValidatorOption,
  inferZodType,
  type PropOption,
} from './getPropOptions';
import { initTSC } from './initTSC';
import { listFrourioFiles } from './listFrourioFiles';
import { writeDefaults } from './writeDefaults';

export const generate = async (appDir: string): Promise<void> => {
  const frourioFiles = listFrourioFiles(appDir);

  await writeDefaults(frourioFiles);

  const { program, checker } = initTSC(frourioFiles);

  await Promise.all(
    frourioFiles.map(async (filePath) => {
      const source = program.getSourceFile(filePath);

      assert(source);

      const spec = ts.forEachChild(source, (node) => {
        if (!ts.isVariableStatement(node)) return;

        const decl = node.declarationList.declarations.find(
          (d) => d.name.getText() === 'frourioSpec',
        );

        if (!decl?.initializer) return;

        const specProps = checker.getTypeAtLocation(decl.initializer).getProperties();
        const paramSymbol = specProps.find((t) => t.getName() === 'param');
        const paramZodType = paramSymbol ? inferZodType(checker, paramSymbol) : null;

        return {
          param: paramZodType ? getValidatorOption(checker, paramZodType) : null,
          methods: specProps
            .map((t) => {
              const type =
                t.valueDeclaration && checker.getTypeOfSymbolAtLocation(t, t.valueDeclaration);

              if (!type) return null;

              const props = type.getProperties();
              const res = props.find((p) => p.getName() === 'res');

              if (!res) return null;

              const resType =
                res.valueDeclaration &&
                checker.getTypeOfSymbolAtLocation(res, res.valueDeclaration);

              if (!resType) return null;

              const querySymbol = props.find((p) => p.getName() === 'query');
              const queryZodType = querySymbol ? inferZodType(checker, querySymbol) : null;

              return {
                name: t.getName(),
                hasHeaders: props.some((p) => p.getName() === 'headers'),
                query: queryZodType ? getPropOptions(checker, queryZodType) : null,
                hasBody: props.some((p) => p.getName() === 'body'),
                res: resType
                  .getProperties()
                  .map((s) => {
                    const statusType =
                      s.valueDeclaration &&
                      checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration);

                    if (!statusType) return null;

                    const statusProps = statusType.getProperties();

                    return {
                      status: s.getName(),
                      hasHeaders: statusProps.some((p) => p.getName() === 'headers'),
                    };
                  })
                  .filter((s) => s !== null),
              };
            })
            .filter((n) => n !== null),
        };
      });

      if (!spec) return;

      await writeFile(
        path.posix.join(filePath, '../', SERVER_FILE),
        serverData(pathToParams(frourioFiles, filePath, spec.param), spec.methods),
        'utf8',
      );
    }),
  );
};

type ParamsInfo = {
  ancestorFrourio: string | undefined;
  middles: string[];
  current:
    | { name: string; param: PropOption | null; array: { isOptional: boolean } | undefined }
    | undefined;
};

const chunkToSlugName = (chunk: string) =>
  chunk.replaceAll('[', '').replace('...', '').replaceAll(']', '');

const pathToParams = (
  frourioFiles: string[],
  filePath: string,
  param: PropOption | null,
): ParamsInfo | undefined => {
  if (!filePath.includes('[')) return undefined;

  const [, tail, ...heads] = filePath.split('/').reverse();
  const ancestorIndex = heads.findIndex((head, i) => {
    return (
      head.startsWith('[') &&
      frourioFiles.includes(path.posix.join(heads.slice(i).reverse().join('/'), FROURIO_FILE))
    );
  });

  return {
    ancestorFrourio:
      ancestorIndex !== -1
        ? `${[...Array(ancestorIndex + 2)].join('../')}${SERVER_FILE.replace('.ts', '')}`
        : undefined,
    middles: heads
      .slice(0, ancestorIndex)
      .filter((h) => h.startsWith('['))
      .map(chunkToSlugName),
    current: tail.startsWith('[')
      ? {
          name: chunkToSlugName(tail),
          param,
          array: tail.includes('...') ? { isOptional: tail.startsWith('[[') } : undefined,
        }
      : undefined,
  };
};

const paramsToText = (params: ParamsInfo) => {
  const paramText = 'frourioSpec.param';
  const current = params.current
    ? `z.object({ ${params.current.name}: ${params.current.param ? (params.current.param.typeName === 'number' ? (params.current.param.isArray ? `paramToNumArr(${paramText})` : `paramToNum(${paramText})`) : paramText) : params.current.array ? `z.array(z.string())${params.current.array.isOptional ? '.optional()' : ''}` : 'z.string()'} })`
    : '';
  const ancestor = 'ancestorParamsValidator';
  const middles = `z.object({ ${params.middles.map((middle) => `${chunkToSlugName(middle)}: z.string()`).join(', ')} })`;

  return `${current}${
    params.current && params.ancestorFrourio
      ? `.and(${ancestor})`
      : params.ancestorFrourio
        ? ancestor
        : ''
  }${params.middles.length === 0 ? '' : params.current || params.ancestorFrourio ? `.and(${middles})` : middles}`;
};

const serverData = (
  params: ParamsInfo | undefined,
  methods: {
    name: string;
    hasHeaders: boolean;
    query: PropOption[] | null;
    hasBody: boolean;
    res: { status: string; hasHeaders: boolean }[];
  }[],
) => `import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import ${params ? '' : 'type '}{ z } from 'zod';${params?.ancestorFrourio ? `\nimport { paramsValidator as ancestorParamsValidator } from '${params.ancestorFrourio}';` : ''}
import { frourioSpec } from './frourio';
import type { ${methods.map((m) => m.name.toUpperCase()).join(', ')} } from './route';

type RouteChecker = [${methods.map((m) => `typeof ${m.name.toUpperCase()}`).join(', ')}];
${params ? `\n${params.current ? `${params.current.param?.typeName !== 'number' ? '' : params.current.param.isArray ? paramToNumArrText : paramToNumText}export ` : ''}const paramsValidator = ${paramsToText(params)};\n` : ''}
type SpecType = typeof frourioSpec;

type Controller = {
${methods
  .map(
    (m) =>
      `  ${m.name}: (req: {${params ? '\n    params: z.infer<typeof paramsValidator>;' : ''}${m.hasHeaders ? `\n    headers: z.infer<SpecType['${m.name}']['headers']>;` : ''}${m.query ? `\n    query: z.infer<SpecType['${m.name}']['query']>;` : ''}${m.hasBody ? `\n    body: z.infer<SpecType['${m.name}']['body']>;` : ''}
  }) => Promise<
${m.res
  .map(
    (r) =>
      `    | {
        status: ${r.status};${r.hasHeaders ? `\n        headers: z.infer<SpecType['${m.name}']['res'][${r.status}]['headers']>;` : ''}
        body: z.infer<SpecType['${m.name}']['res'][${r.status}]['body']>;
      }`,
  )
  .join('\n')}
  >;`,
  )
  .join('\n')}
};

type FrourioErr =
  | { status: 422; error: string; issues: { path: (string | number)[]; message: string }[] }
  | { status: 500; error: string; issues?: undefined };

type ResHandler = {
${methods
  .map(
    (m) => `  ${m.name.toUpperCase()}: (
    req: NextRequest,${params ? '\n    option: { params: Promise<unknown> },' : ''}
  ) => Promise<
    NextResponse<
${m.res.map((r) => `      | z.infer<SpecType['${m.name}']['res'][${r.status}]['body']>`).join('\n')}
      | FrourioErr
    >
  >;`,
  )
  .join('\n')}
};

const toHandler = (controller: Controller): ResHandler => {
  return {
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
${m.query.map((p) => `        ${p.name}: ${p.typeName === 'string' ? '' : `queryTo${p.typeName === 'number' ? 'Num' : 'Bool'}${p.isArray ? 'Arr' : ''}(`}req.nextUrl.searchParams.get${p.isArray ? 'All' : ''}('${p.name}')${p.isArray ? '' : ' ?? undefined'}${p.typeName === 'string' ? '' : ')'},`).join('\n')}
      })`,
      ],
      m.hasBody && [
        'body',
        `frourioSpec.${m.name}.body.safeParse(await req.json().catch(() => undefined))`,
      ],
    ].filter((r) => !!r);

    return `    ${m.name.toUpperCase()}: async (req${params ? ', option' : ''}) => {${requests.map((r) => `\n      const ${r[0]} = ${r[1]};\n\n      if (${r[0]}.error) return createReqErr(${r[0]}.error);\n`).join('')}${params ? '\n      const params = paramsValidator.safeParse(await option.params);\n\n      if (params.error) return createReqErr(params.error);\n' : ''}
      const res = await controller.${m.name}({ ${[...(params ? ['params: params.data'] : []), ...requests.map((r) => `${r[0]}: ${r[0]}.data`)].join(', ')} });

      switch (res.status) {
${m.res
  .map((r) => {
    const resTypes = [r.hasHeaders && 'headers', 'body'].filter((r) => r !== false);

    return `        case ${r.status}: {${resTypes.map((t) => `\n          const ${t} = frourioSpec.${m.name}.res[${r.status}].${t}.safeParse(res.${t});\n\n          if (${t}.error) return createResErr();\n`).join('')}
          return NextResponse.json(body.data, { status: ${r.status}${r.hasHeaders ? ', headers: headers.data' : ''} });
        }`;
  })
  .join('\n')}
        default:
          throw new Error(res${m.res.length <= 1 ? '.status' : ''} satisfies never);
      }
    },`;
  })
  .join('\n')}
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
${methods.some((m) => m.query?.some((q) => q.typeName === 'number' && !q.isArray)) ? queryToNumText : ''}${methods.some((m) => m.query?.some((q) => q.typeName === 'number' && q.isArray)) ? queryToNumArrText : ''}${methods.some((m) => m.query?.some((q) => q.typeName === 'boolean' && !q.isArray)) ? queryToBoolText : ''}${methods.some((m) => m.query?.some((q) => q.typeName === 'boolean' && q.isArray)) ? queryToBoolArrText : ''}`;

const paramToNumText = `const paramToNum = <T extends z.ZodTypeAny>(validator: T) =>
  z.string().transform<z.infer<T>>((val, ctx) => {
    const numVal = Number(val);
    const parsed = validator.safeParse(isNaN(numVal) ? val : numVal);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

`;

const paramToNumArrText = `const paramToNumArr = <T extends z.ZodTypeAny>(validator: T) =>
  z.array(z.string()).optional().transform<z.infer<T>>((val, ctx) => {
    const numArr = val?.map((v) => {
      const numVal = Number(v);

      return isNaN(numVal) ? v : numVal;
    });
    const parsed = validator.safeParse(numArr);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

`;

const queryToNumText = `
const queryToNum = (val: string | undefined) => {
  const num = Number(val);

  return isNaN(num) ? val : num;
};
`;

const queryToNumArrText = `
const queryToNumArr = (val: string[]) =>
  val.map((v) => {
    const numVal = Number(v);

    return isNaN(numVal) ? v : numVal;
  });
`;

const queryToBoolText = `
const queryToBool = (val: string | undefined) =>
  val === 'true' ? true : val === 'false' ? false : val;
`;

const queryToBoolArrText = `
const queryToBoolArr = (val: string[]) =>
  val.map((v) => (v === 'true' ? true : v === 'false' ? false : v));
`;
