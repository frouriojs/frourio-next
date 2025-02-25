import { readdirSync } from 'fs';
import path from 'path';
import { FROURIO_FILE } from './constants';

export const listFrourioFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true })
    .reduce<string[]>(
      (prev, d) => [
        ...prev,
        ...(d.isFile() && d.name === FROURIO_FILE
          ? [path.posix.join(dir.replaceAll('\\', '/'), d.name)]
          : !d.isDirectory() || d.name.startsWith('_')
            ? []
            : listFrourioFiles(path.posix.join(dir, d.name))),
      ],
      [],
    )
    .sort();
