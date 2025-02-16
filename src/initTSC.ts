import ts from 'typescript';

export const initTSC = (frourioFiles: string[]) => {
  const configDir = process.cwd();
  const configFileName = ts.findConfigFile(configDir, ts.sys.fileExists);

  const compilerOptions = configFileName
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(configFileName, ts.sys.readFile).config,
        ts.sys,
        configDir,
      )
    : undefined;

  const program = ts.createProgram(frourioFiles, compilerOptions?.options ?? {});

  return { program, checker: program.getTypeChecker() };
};
