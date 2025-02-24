import path from 'path';
import { getConfig } from '../getConfig';

export const getOpenapiConfig = (
  output: string | undefined,
  dir = process.cwd(),
): {
  appDir: string | undefined;
  output: string;
} => {
  const config = getConfig(dir);

  return { appDir: config.appDir, output: output ?? path.posix.join(dir, 'public/openapi.json') };
};
