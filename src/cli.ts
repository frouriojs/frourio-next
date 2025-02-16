import minimist from 'minimist';
import build from './buildTemplate';
import getConfig from './getConfig';
import watch from './watchInputDir';
import write from './writeRouteFile';

export const run = async (args: string[]) => {
  const argv = minimist(args, {
    string: ['watch', 'output'],
    alias: { w: 'watch', o: 'output' },
  });

  if (argv.watch !== undefined) {
    const config = await getConfig(argv.output);

    write(build(config));

    if (config.appDir) watch(config.appDir.input, () => write(build(config)));
  } else {
    await getConfig(argv.output).then(build).then(write);
  }
};
