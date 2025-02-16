import assert from 'assert';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { expect, test } from 'vitest';
import { generate } from '../src/generate';
import { getConfig } from '../src/getConfig';

test('generate', async () => {
  const projectDirs = fs
    .readdirSync('./projects', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join('./projects', d.name));

  for (const dir of projectDirs) {
    const { appDir } = getConfig(dir);

    assert(appDir);

    await generate(appDir);
  }

  const out = execSync('git status', { encoding: 'utf8' });

  expect(out).toMatch('nothing to commit, working tree clean');
});
