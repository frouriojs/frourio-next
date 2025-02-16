import { readdirSync } from 'fs';
import { FROURIO_FILE } from './constants';

export const listFrourioFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).reduce<string[]>(
    (prev, d) => [
      ...prev,
      ...(d.isFile() && d.name === FROURIO_FILE
        ? [`${dir}/${d.name}`]
        : !d.isDirectory() || d.name.startsWith('_')
          ? []
          : listFrourioFiles(`${dir}/${d.name}`)),
    ],
    [],
  );
