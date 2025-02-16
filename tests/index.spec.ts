import assert from 'assert';
import { execSync } from 'child_process';
import fs from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';
import { expect, test } from 'vitest';
import { SERVER_FILE } from '../src/constants';
import { generate } from '../src/generate';
import { getConfig } from '../src/getConfig';
import { listFrourioFiles } from '../src/listFrourioFiles';

test('generate', async () => {
  const projectDirs = fs
    .readdirSync('./projects', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join('./projects', d.name));

  for (const dir of projectDirs) {
    const { appDir } = getConfig(dir);

    assert(appDir);

    const frourioFiles = listFrourioFiles(appDir);

    await Promise.all(frourioFiles.map((file) => unlink(path.join(file, '../', SERVER_FILE))));
    await generate(appDir);
  }

  const out = execSync('git status', { encoding: 'utf8' });

  expect(out).toMatch('nothing to commit, working tree clean');
});
