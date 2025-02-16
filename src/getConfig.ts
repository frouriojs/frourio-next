import fs from 'fs';
import path from 'path';

export type Config = {
  appDir: string | undefined;
};

export const getConfig = (dir = process.cwd()): Config => {
  const srcDir = fs.existsSync(path.posix.join(dir, 'src/app')) ? path.posix.join(dir, 'src') : dir;
  const appDir = path.posix.join(srcDir, 'app');
  const isAppDirUsed = fs.existsSync(appDir);

  return { appDir: isAppDirUsed ? appDir : undefined };
};
