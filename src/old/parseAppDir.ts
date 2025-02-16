import fs from 'fs';
import path from 'path';
import { replaceWithUnderscore } from './replaceWithUnderscore';

type Slugs = string[];

export const createMethods = (indent: string, slugs: Slugs, pathname: string) =>
  `${indent}  $url: (url?: { hash?: string }) => ({ pathname: '${pathname}' as const${
    slugs.length ? `, query: { ${slugs.join(', ')} }` : ''
  }, hash: url?.hash, path: \`${pathname
    .replace(/\[\[?\.\.\.(.*?)\]\]?/g, `\${$1?.join('/')}`)
    .replace(/\[(.*?)\]/g, `\${$1}`)}\${buildSuffix(url)}\` })`;

export const parseAppDir = (input: string): string => {
  const pageFileNames = ['page.tsx', 'page.jsx', 'page.js'];
  const createPathObjString = (
    targetDir: string,
    parentIndent: string,
    url: string,
    slugs: Slugs,
    text: string,
    methodsOfIndexTsFile?: string,
  ) => {
    const indent = `  ${parentIndent}`;
    const props: string[] = fs
      .readdirSync(targetDir)
      .filter((file) => fs.statSync(path.posix.join(targetDir, file)).isDirectory())
      .sort()
      .map((file) => {
        const newSlugs = [...slugs];
        const target = path.posix.join(targetDir, file);
        if (file.startsWith('(') && file.endsWith(')')) {
          const indexFile = fs.readdirSync(target).find((name) => pageFileNames.includes(name));
          return createPathObjString(
            target,
            indent.slice(2),
            url,
            newSlugs,
            '<% props %>',
            indexFile && createMethods(indent.slice(2), newSlugs, url),
          );
        }

        const isParallelRoute = file.startsWith('@');
        const newUrl = isParallelRoute ? url : `${url}/${file}`;

        let valFn = `${indent}'${replaceWithUnderscore(file)}': {\n<% next %>\n${indent}}`;

        if (file.startsWith('[') && file.endsWith(']')) {
          const slug = file.replace(/[.[\]]/g, '');
          valFn = `${indent}${`_${slug}`}: (${slug}${file.startsWith('[[') ? '?' : ''}: ${
            /\[\./.test(file) ? 'string[]' : 'string | number'
          }) => ({\n<% next %>\n${indent}})`;
          newSlugs.push(slug);
        }

        const indexFile = fs.readdirSync(target).find((name) => pageFileNames.includes(name));

        return createPathObjString(
          target,
          indent,
          newUrl,
          newSlugs,
          valFn.replace('<% next %>', '<% props %>'),
          indexFile && createMethods(indent, newSlugs, newUrl),
        );
      })
      .filter(Boolean);

    const joinedProps = props
      .reduce<string[]>((accumulator, current) => {
        const last = accumulator[accumulator.length - 1];

        if (last !== undefined) {
          const [a, ...b] = last.split('\n');
          const [x, ...y] = current.split('\n');

          if (a === x) {
            y.pop();
            const z = y.pop();
            const merged = [a, ...y, `${z},`, ...b].join('\n');
            return [...accumulator.slice(0, -1), merged];
          }
        }

        return [...accumulator, current];
      }, [])
      .join(',\n');

    return text.replace(
      '<% props %>',
      `${joinedProps}${
        methodsOfIndexTsFile ? `${props.length ? ',\n' : ''}${methodsOfIndexTsFile}` : ''
      }`,
    );
  };

  const rootIndexFile = fs.readdirSync(input).find((name) => pageFileNames.includes(name));
  const rootIndent = '';
  let rootMethods;

  if (rootIndexFile) {
    rootMethods = createMethods(rootIndent, [], '/');
  }

  return createPathObjString(input, rootIndent, '', [], '<% props %>', rootMethods);
};
