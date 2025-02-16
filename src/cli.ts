import minimist from 'minimist';
import { generate } from './generate';
import getConfig from './getConfig';
import build from './old/buildTemplate';
import watch from './watchInputDir';
import write from './writeRouteFile';

export const run = async (args: string[]) => {
  const argv = minimist(args, {
    string: ['watch', 'output'],
    alias: { w: 'watch', o: 'output' },
  });

  const { appDir, output } = getConfig(argv.output);

  if (!appDir) return;

  write(build({ appDir, output }));
  await generate(appDir);

  if (argv.watch !== undefined) watch(appDir, () => generate(appDir));
};
