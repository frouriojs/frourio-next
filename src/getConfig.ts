import fs from 'fs';
import path from 'path';

export type Config = {
  appDir: string | undefined;
  output: string;
};

export default (output: string | undefined, dir = process.cwd()): Config => {
  const srcDir = fs.existsSync(path.posix.join(dir, 'src/app')) ? path.posix.join(dir, 'src') : dir;
  const appDir = path.posix.join(srcDir, 'app');
  const isAppDirUsed = fs.existsSync(appDir);

  let outDir = output;

  if (!outDir) {
    const utilsPath = path.join(srcDir, 'utils');
    outDir = fs.existsSync(utilsPath) ? utilsPath : path.join(srcDir, 'lib');
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  return { output: outDir, appDir: isAppDirUsed ? appDir : undefined };
};
