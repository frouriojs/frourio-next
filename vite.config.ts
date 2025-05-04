import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';
import type { InlineConfig } from 'vitest/node';

const includeFile = process.argv[4];
const testBase: InlineConfig = { environment: 'jsdom', setupFiles: ['./tests/setup.ts'] };
const coverageBase = {
  include: ['src/**/*.ts'],
  exclude: [
    'src/cli.ts',
    'src/getConfig.ts',
    'src/initTSC.ts',
    'src/watchInputDir.ts',
    'src/writeDefaults.ts',
    'src/openapi/cli.ts',
    'src/msw/cli.ts',
  ],
};

export default defineConfig({
  plugins: [react()],
  test:
    includeFile === undefined
      ? {
          ...testBase,
          coverage: {
            ...coverageBase,
            thresholds: { statements: 98, branches: 95, functions: 100, lines: 98 },
          },
        }
      : { ...testBase, coverage: coverageBase, include: [includeFile] },
});
