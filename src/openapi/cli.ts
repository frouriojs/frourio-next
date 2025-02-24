import minimist from 'minimist';
import watch from '../watchInputDir';
import { generateOpenapi } from './generateOpenapi';
import { getOpenapiConfig } from './getOpenapiConfig';

export const run = async (args: string[]) => {
  const argv = minimist(args, {
    string: ['output', 'watch'],
    alias: { o: 'output', w: 'watch' },
  });

  const { appDir, output } = getOpenapiConfig(argv.output);

  if (!appDir) return;

  await generateOpenapi(appDir, output);

  if (argv.watch !== undefined) watch(appDir, () => generateOpenapi(appDir, output));
};
