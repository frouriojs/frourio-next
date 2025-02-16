import fs from 'fs';
// import type { NextConfig } from 'next/dist/server/config'
import type { NextConfig } from 'next';
import path from 'path';

export type Config = {
  appDir: { input: string } | undefined;
  staticDir: string | undefined;
  output: string;
  basepath?: string | undefined;
};

export default async (
  enableStatic: boolean,
  output: string | undefined,
  dir = process.cwd(),
): Promise<Config> => {
  let config: NextConfig;

  try {
    // >= v11.1.0
    config = await require('next/dist/server/config').default(
      require('next/constants').PHASE_PRODUCTION_BUILD,
      dir,
    );
  } catch (_) {
    // < v11.1.0
    config = await require('next/dist/next-server/server/config').default(
      require('next/constants').PHASE_PRODUCTION_BUILD,
      dir,
    );
  }

  const srcDir =
    fs.existsSync(path.posix.join(dir, 'src/pages')) ||
    fs.existsSync(path.posix.join(dir, 'src/app'))
      ? path.posix.join(dir, 'src')
      : dir;

  const isAppDirUsed = fs.existsSync(path.posix.join(srcDir, 'app'));

  let outDir = output;

  if (!outDir) {
    const utilsPath = path.join(srcDir, 'utils');
    outDir = fs.existsSync(utilsPath) ? utilsPath : path.join(srcDir, 'lib');
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  return {
    staticDir: enableStatic ? path.posix.join(dir, 'public') : undefined,
    output: outDir,
    appDir: isAppDirUsed ? { input: path.posix.join(srcDir, 'app') } : undefined,
    basepath: config.basePath,
  };
};
