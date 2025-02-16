import { parseAppDir } from './parseAppDir';

export const createNextTemplate = (
  output: string,
  appDir: { input: string } | undefined,
): string => {
  const appDirData = appDir ? parseAppDir(appDir.input, output) : { imports: [], text: '' };

  return `${appDirData.imports.join('\n')}${appDirData.imports.length ? '\n\n' : ''}${
    appDir
      ? `const buildSuffix = (url?: { query?: any, hash?: string }) => {
  const query = url?.query;
  const hash = url?.hash;

  return \`\${query ? \`?\${new URLSearchParams(query)}\` : ''}\${hash ? \`#\${hash}\` : ''}\`;
};

`
      : ''
  }export const pagesPath = {
${appDirData.text}
};

export type PagesPath = typeof pagesPath;
`;
};
