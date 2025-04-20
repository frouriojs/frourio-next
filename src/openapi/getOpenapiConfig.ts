import path from 'path';
import { getConfig } from '../getConfig';

export type OpenapiConfig = {
  appDir: string | undefined;
  basePath: string | undefined;
  output: string;
  root: string | undefined;
};

export const getOpenapiConfig = async ({
  output,
  root,
  dir = process.cwd(),
}: {
  output: string | undefined;
  root: string | undefined;
  dir?: string;
}): Promise<OpenapiConfig> => {
  const config = await getConfig(dir);

  return { ...config, output: output ?? path.posix.join(dir, 'public/openapi.json'), root };
};
