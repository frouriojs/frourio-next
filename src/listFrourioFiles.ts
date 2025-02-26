import { readdirSync } from 'fs';
import path from 'path';
import { FROURIO_FILE } from './constants';

const listDirNames = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).reduce<string[]>(
    (prev, d) => [
      ...prev,
      ...(d.isFile() && d.name === FROURIO_FILE
        ? [dir.replaceAll('\\', '/')]
        : !d.isDirectory() || d.name.startsWith('_')
          ? []
          : listDirNames(path.posix.join(dir, d.name))),
    ],
    [],
  );

export const listFrourioFiles = (dir: string): string[] =>
  listDirNames(dir)
    .sort()
    .map((f) => path.posix.join(f, FROURIO_FILE));
