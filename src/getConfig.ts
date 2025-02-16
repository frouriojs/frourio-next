import fs from 'fs';
import path from 'path';

export type Config = {
  appDir: { input: string } | undefined;
  output: string;
};

export default async (output: string | undefined, dir = process.cwd()): Promise<Config> => {
  const srcDir = fs.existsSync(path.posix.join(dir, 'src/app')) ? path.posix.join(dir, 'src') : dir;

  const isAppDirUsed = fs.existsSync(path.posix.join(srcDir, 'app'));

  let outDir = output;

  if (!outDir) {
    const utilsPath = path.join(srcDir, 'utils');
    outDir = fs.existsSync(utilsPath) ? utilsPath : path.join(srcDir, 'lib');
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  return {
    output: outDir,
    appDir: isAppDirUsed ? { input: path.posix.join(srcDir, 'app') } : undefined,
  };
};
