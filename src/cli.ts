import minimist from 'minimist';
import { generate } from './generate';
import { getConfig } from './getConfig';
import watch from './watchInputDir';

export const run = async (args: string[]) => {
  const argv = minimist(args, {
    string: ['watch'],
    alias: { w: 'watch' },
  });

  const { appDir } = getConfig();

  if (!appDir) return;

  await generate(appDir);

  if (argv.watch !== undefined) watch(appDir, () => generate(appDir));
};
