import assert from 'assert';
import { execSync } from 'child_process';
import fs from 'fs';
import { unlink } from 'fs/promises';
import { NextRequest } from 'next/server';
import path from 'path';
import { expect, test } from 'vitest';
import * as paramsRoute from '../projects/nextjs-appdir/app/[a]/[b]/[...c]/route';
import * as baseRoute from '../projects/nextjs-appdir/app/route';
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

test('base handler', async () => {
  const res1 = await baseRoute.GET(new NextRequest('http://example.com/'));

  expect(res1.status).toBe(422);

  const val = 'foo';
  const res2 = await baseRoute.GET(new NextRequest(`http://example.com/?aa=${val}`));

  await expect(res2.json()).resolves.toEqual({ bb: val });

  const res3 = await baseRoute.POST(new NextRequest('http://example.com/'));

  expect(res3.status).toBe(422);

  const body = { bb: 3 };
  const res4 = await baseRoute.POST(
    new NextRequest('http://example.com/', { method: 'POST', body: JSON.stringify(body) }),
  );

  await expect(res4.json()).resolves.toEqual([body.bb]);
  expect(res4.headers.get('Set-Cookie')).toBe('aaa');
});

test('params handler', async () => {
  const res = await paramsRoute.GET(new NextRequest('http://example.com/aaa/bbb/ccc'), {
    params: Promise.resolve({ a: '111', b: 'bbb', c: ['ccc'] }),
  });

  await expect(res.json()).resolves.toEqual({ value: [111, 'bbb', 'ccc'] });
});
