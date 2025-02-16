import { parseAppDir } from './parseAppDir';

export const createNextTemplate = (appDir: { input: string } | undefined): string => {
  const text = appDir ? parseAppDir(appDir.input) : '';

  return `${
    appDir
      ? `const buildSuffix = (url?: { hash?: string }) => {
  const hash = url?.hash;

  return hash ? \`#\${hash}\` : '';
};

`
      : ''
  }export const pagesPath = {
${text}
};

export type PagesPath = typeof pagesPath;
`;
};
