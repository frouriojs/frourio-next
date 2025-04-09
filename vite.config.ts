import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

const includeFile = process.argv[4];
const testBase = { environment: 'jsdom', setupFiles: ['./tests/setup.ts'] };
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
  plugins: [react()],
  test:
    includeFile === undefined
      ? {
          ...testBase,
          coverage: {
            ...coverageBase,
            thresholds: { statements: 98, branches: 94, functions: 100, lines: 98 },
          },
        }
      : { ...testBase, coverage: coverageBase, include: [includeFile] },
});
