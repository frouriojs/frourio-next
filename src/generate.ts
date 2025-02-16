import assert from 'assert';
import { existsSync } from 'fs';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import ts from 'typescript';
import { FROURIO_FILE, SERVER_FILE } from './constants';
import { initTSC } from './initTSC';

export const generate = async (appDir: string): Promise<void> => {
  const { program, checker } = initTSC(appDir);
  const createFiles = async (dir: string): Promise<void> => {
    const children = await readdir(dir, { withFileTypes: true });

    await Promise.all(
      children.map(async (dirent) => {
        if (dirent.isDirectory()) {
          if (dirent.name.startsWith('_')) return;

          await createFiles(path.join(dir, dirent.name));
        } else if (dirent.isFile()) {
          await writeTypeFile(dir, dirent.name);
        }
      }),
    );
  };

  const writeTypeFile = async (dir: string, filename: string): Promise<void> => {
    if (filename !== FROURIO_FILE) return;

    const filePath = path.join(dir, filename);
    const fileText = await readFile(filePath, 'utf8');

    if (fileText === '') {
      await writeFile(filePath, defaultData, 'utf8');

      const routePath = path.join(dir, 'route.ts');

      if (!existsSync(routePath)) await writeFile(routePath, defaultRouteData, 'utf8');
    }

    const source = program.getSourceFile(filePath);

    assert(source);

    const methods = ts.forEachChild(
      source,
      (node) =>
        ts.isExportAssignment(node) &&
        node.forEachChild(
          (nod) =>
            ts.isCallExpression(nod) &&
            checker
              .getResolvedSignature(nod)
              ?.getReturnType()
              .getProperties()
              .map((t) => {
                const type =
                  t.valueDeclaration && checker.getTypeOfSymbolAtLocation(t, t.valueDeclaration);

                if (!type) return null;

                const props = type.getProperties();
                const res = props.find((p) => p.escapedName === 'res');

                if (!res) return null;

                const resType =
                  res.valueDeclaration &&
                  checker.getTypeOfSymbolAtLocation(res, res.valueDeclaration);

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
                        s.valueDeclaration &&
                        checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration);

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
              .filter((n) => n !== null),
        ),
    );

    if (!methods) return;

    await writeFile(path.join(dir, SERVER_FILE), serverData(methods), 'utf8');
  };

  await createFiles(appDir);
};

const defaultData = `import { defineMethods } from '@frourio/next/defineMethods';
import { z } from 'zod';

export default defineMethods({
  get: {
    res: { 200: { body: z.string() } },
  },
});
`;

const defaultRouteData = `import { defineRoute } from './${SERVER_FILE.replace('.ts', '')}';

export const { GET } = defineRoute({
  get: async () => ({ status: 200, body: 'ok' }),
});
`;

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
import methods from './frourio';
import type { ${methods.map((m) => m.name.toUpperCase()).join(', ')} } from './route';

type MethodChecker = [${methods.map((m) => `typeof ${m.name.toUpperCase()}`).join(', ')}];

type MethodsType = typeof methods;

type Controller = {
${methods
  .map(
    (m) =>
      `  ${m.name}: (req: {${m.hasHeaders ? `\n    headers: z.infer<MethodsType['${m.name}']['headers']>;` : ''}${m.hasQuery ? `\n    query: z.infer<MethodsType['${m.name}']['query']>;` : ''}${m.hasBody ? `\n    body: z.infer<MethodsType['${m.name}']['body']>;` : ''}
  }) => Promise<
${m.res
  .map(
    (r) =>
      `    | {
        status: ${r.status};${r.hasHeaders ? `\n        headers: z.infer<MethodsType['${m.name}']['res'][${r.status}]['headers']>;` : ''}
        body: z.infer<MethodsType['${m.name}']['res'][${r.status}]['body']>;
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
${m.res.map((r) => `      | z.infer<MethodsType['${m.name}']['res'][${r.status}]['body']>`).join('\n')}
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
      const res = await controller.${m.name}({${m.hasHeaders ? `\n        headers: methods.${m.name}.headers.parse(Object.fromEntries(req.headers)),` : ''}${m.hasQuery ? `\n        query: methods.${m.name}.query.parse(Object.fromEntries(req.nextUrl.searchParams)),` : ''}${m.hasBody ? `\n        body: methods.${m.name}.body.parse(await req.json()),` : ''}
      });

      switch (res.status) {
${m.res
  .map(
    (r) => `        case ${r.status}:
          return NextResponse.json(methods.${m.name}.res[${r.status}].body.parse(res.body), {
            status: ${r.status},${r.hasHeaders ? `\n            headers: methods.${m.name}.res[${r.status}].headers.parse(res.headers),` : ''}
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
`;
