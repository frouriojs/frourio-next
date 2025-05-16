import { createHash } from './createHash';

export const generateRelativePath = ({
  appDir,
  dirPath,
}: {
  appDir: string;
  dirPath: string;
}): string => dirPath.replace(appDir, '');

export const createDirPathHash = (paths: { appDir: string; dirPath: string }): string =>
  createHash(generateRelativePath(paths));
