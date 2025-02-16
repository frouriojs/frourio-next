import { readdirSync } from 'fs';
import ts from 'typescript';
import { FROURIO_FILE } from './constants';

export const initTSC = (appDir: string) => {
  const configDir = process.cwd();
  const configFileName = ts.findConfigFile(configDir, ts.sys.fileExists);

  const compilerOptions = configFileName
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(configFileName, ts.sys.readFile).config,
        ts.sys,
        configDir,
      )
    : undefined;

  const program = ts.createProgram(findFrourioFiles(appDir), compilerOptions?.options ?? {});

  return { program, checker: program.getTypeChecker() };
};

const findFrourioFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).reduce<string[]>(
    (prev, d) => [
      ...prev,
      ...(d.isDirectory()
        ? findFrourioFiles(`${dir}/${d.name}`)
        : d.name === FROURIO_FILE
          ? [`${dir}/${d.name}`]
          : []),
    ],
    [],
  );
