import minimist from 'minimist';
import watch from '../watchInputDir';
import { generateOpenapi } from './generateOpenapi';
import { getOpenapiConfig } from './getOpenapiConfig';

export const run = async (args: string[]) => {
  const argv = minimist(args, {
    string: ['output', 'watch'],
    alias: { o: 'output', w: 'watch' },
  });

  const config = await getOpenapiConfig(argv.output);

  generateOpenapi(config);

  if (argv.watch !== undefined && config.appDir) {
    watch(config.appDir, () => generateOpenapi(config));
  }
};
