import { defineConfig } from 'vitest/config';

const includeFile = process.argv[4];
const coverageBase = {
  include: ['src/**/*.ts'],
  exclude: [
    'src/cli.ts',
    'src/getConfig.ts',
    'src/initTSC.ts',
    'src/watchInputDir.ts',
    'src/writeDefaults.ts',
    'src/openapi/cli.ts',
  ],
};

export default defineConfig({
  test:
    includeFile === undefined
      ? {
          coverage: {
            ...coverageBase,
            thresholds: { statements: 98, branches: 98, functions: 100, lines: 98 },
          },
        }
      : { coverage: coverageBase, include: [includeFile] },
});
