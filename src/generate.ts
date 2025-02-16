import assert from 'assert';
import { writeFile } from 'fs/promises';
import path from 'path';
import ts from 'typescript';
import { SERVER_FILE } from './constants';
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

      const methods = ts.forEachChild(source, (node) => {
        if (!ts.isVariableStatement(node)) return;

        const decl = node.declarationList.declarations.find(
          (d) => d.name.getText() === 'frourioSpec',
        );

        if (!decl?.initializer) return;

        return checker
          .getTypeAtLocation(decl.initializer)
          .getProperties()
          .map((t) => {
            const type =
              t.valueDeclaration && checker.getTypeOfSymbolAtLocation(t, t.valueDeclaration);

            if (!type) return null;

            const props = type.getProperties();
            const res = props.find((p) => p.escapedName === 'res');

            if (!res) return null;

            const resType =
              res.valueDeclaration && checker.getTypeOfSymbolAtLocation(res, res.valueDeclaration);

            if (!resType) return null;

            return {
              name: t.escapedName.toString(),
              hasHeaders: props.some((p) => p.escapedName === 'headers'),
              hasQuery: props.some((p) => p.escapedName === 'query'),
              hasBody: props.some((p) => p.escapedName === 'body'),
              res: resType
                .getProperties()
                .map((s) => {
                  const statusType =
                    s.valueDeclaration && checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration);

                  if (!statusType) return null;

                  const statusProps = statusType.getProperties();

                  return {
                    status: s.escapedName.toString(),
                    hasHeaders: statusProps.some((p) => p.escapedName === 'headers'),
                  };
                })
                .filter((s) => s !== null),
            };
          })
          .filter((n) => n !== null);
      });

      if (!methods) return;

      await writeFile(path.join(filePath, '../', SERVER_FILE), serverData(methods), 'utf8');
    }),
  );
};

const serverData = (
  methods: {
    name: string;
    hasHeaders: boolean;
    hasQuery: boolean;
    hasBody: boolean;
    res: { status: string; hasHeaders: boolean }[];
  }[],
) => `import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { frourioSpec } from './frourio';
import type { ${methods.map((m) => m.name.toUpperCase()).join(', ')} } from './route';

type RouteChecker = [${methods.map((m) => `typeof ${m.name.toUpperCase()}`).join(', ')}];

type SpecType = typeof frourioSpec;

type Controller = {
${methods
  .map(
    (m) =>
      `  ${m.name}: (req: {${m.hasHeaders ? `\n    headers: z.infer<SpecType['${m.name}']['headers']>;` : ''}${m.hasQuery ? `\n    query: z.infer<SpecType['${m.name}']['query']>;` : ''}${m.hasBody ? `\n    body: z.infer<SpecType['${m.name}']['body']>;` : ''}
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

type ResHandler = {
${methods
  .map(
    (m) => `  ${m.name.toUpperCase()}: (
    req: NextRequest,
  ) => Promise<
    NextResponse<
${m.res.map((r) => `      | z.infer<SpecType['${m.name}']['res'][${r.status}]['body']>`).join('\n')}
    >
  >;`,
  )
  .join('\n')}
};

const toHandler = (controller: Controller): ResHandler => {
  return {
${methods
  .map(
    (m) => `    ${m.name.toUpperCase()}: async (req: NextRequest) => {
      const res = await controller.${m.name}({${m.hasHeaders ? `\n        headers: frourioSpec.${m.name}.headers.parse(Object.fromEntries(req.headers)),` : ''}${m.hasQuery ? `\n        query: frourioSpec.${m.name}.query.parse(Object.fromEntries(req.nextUrl.searchParams)),` : ''}${m.hasBody ? `\n        body: frourioSpec.${m.name}.body.parse(await req.json()),` : ''}
      });

      switch (res.status) {
${m.res
  .map(
    (r) => `        case ${r.status}:
          return NextResponse.json(frourioSpec.${m.name}.res[${r.status}].body.parse(res.body), {
            status: ${r.status},${r.hasHeaders ? `\n            headers: frourioSpec.${m.name}.res[${r.status}].headers.parse(res.headers),` : ''}
          });`,
  )
  .join('\n')}
        default:
          throw new Error(res${m.res.length <= 1 ? '.status' : ''} satisfies never);
      }
    },`,
  )
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
`;
