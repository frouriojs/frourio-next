import minimist from 'minimist';
import { generate } from './generate';
import { getConfig } from './getConfig';
import watch from './watchInputDir';

export const run = async (args: string[]) => {
  const argv = minimist(args, {
    string: ['watch'],
    alias: { w: 'watch' },
  });

  const config = await getConfig();

  await generate(config);

  if (argv.watch !== undefined && config.appDir) {
    watch(config.appDir, () => generate(config));
  }
};
