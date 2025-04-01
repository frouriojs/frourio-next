import path from 'path';
import { getConfig } from '../getConfig';

export type OpenapiConfig = {
  appDir: string | undefined;
  basePath: string | undefined;
  output: string;
};

export const getOpenapiConfig = async (
  output: string | undefined,
  dir = process.cwd(),
): Promise<OpenapiConfig> => {
  const config = await getConfig(dir);

  return { ...config, output: output ?? path.posix.join(dir, 'public/openapi.json') };
};
