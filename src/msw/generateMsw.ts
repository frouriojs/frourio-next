import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';
import { FROURIO_FILE } from '../constants';
import { createHash } from '../createHash';
import { initTSC } from '../initTSC';
import { listFrourioDirs } from '../listFrourioDirs';
import type { MswConfig } from './getMswConfig';

export const generateMsw = ({ appDir, output }: MswConfig) => {
  if (!appDir) return;

  const frourioDirs = listFrourioDirs(path.resolve(appDir));
  const { program, checker } = initTSC(frourioDirs);
  const specs = frourioDirs
    .map((dirPath) => {
      const source = program.getSourceFile(path.posix.join(dirPath, FROURIO_FILE));
      const methods = source?.forEachChild((node) => {
        if (!ts.isVariableStatement(node)) return;

        const decl = node.declarationList.declarations.find(
          (d) => d.name.getText() === 'frourioSpec',
        );

        if (!decl?.initializer) return;

        const specProps = checker.getTypeAtLocation(decl.initializer).getProperties();

        return specProps
          .map((t) =>
            t.getName() === 'param' || t.getName() === 'middleware' ? null : t.getName(),
          )
          .filter((n) => n !== null);
      });

      return methods && { posixDirPath: dirPath.replaceAll('\\', '/'), methods };
    })
    .filter((d) => d !== undefined)
    .filter((d) => d.methods.length > 0);

  const posixAppDir = appDir.replaceAll('\\', '/');
  const mswText = `import { http, type RequestHandler } from 'msw';
${specs.map(({ posixDirPath }) => `import * as route_${createHash(posixDirPath.replace(posixAppDir, ''))} from '${path.posix.relative(path.posix.resolve(output.replaceAll('\\', '/')).split('/').slice(0, -1).join('/'), `${posixDirPath}/route`)}';\n`).join('')}
export function setupMswHandlers(baseURL = ''): RequestHandler[] {
  return [
${specs
  .flatMap(({ posixDirPath, methods }) => {
    const methodPath = posixDirPath.replace(posixAppDir, '').replace(/\(.+\)\/?/g, '');
    const hasParams = methodPath.includes('/[');
    const paramsChunk = hasParams
      ? `
      const pathChunks = request.url.replace(baseURL, '').split('/');
      const params = {${methodPath
        .split('/')
        .flatMap((name, index) =>
          name.startsWith('[')
            ? ` '${name.replace(/[[\].]/g, '')}': ${name.includes('...') ? `pathChunks.slice(${index})` : `\`\${pathChunks[${index}]}\``}`
            : [],
        )
        .join(',')} };\n`
      : '';

    return methods.map((method) => {
      return `    http.${method}(\`\${baseURL}${methodPath.replace(/\[+\.\.\..+?]+/, '*').replace(/\[(.+?)]/g, ':$1')}\`, ({ request }) => {${paramsChunk}
      return route_${createHash(posixDirPath.replace(posixAppDir, ''))}.${method.toUpperCase()}(request${
        hasParams ? `, { params: Promise.resolve(params) }` : ''
      });
    }),\n`;
    });
  })
  .join('')}  ];
}
`;

  if (existsSync(output) && readFileSync(output, 'utf8') === mswText) return;

  writeFileSync(output, mswText);
  console.log(`${output} was generated successfully.`);
};
