import assert from 'assert';
import { execSync } from 'child_process';
import fs from 'fs';
import { unlink } from 'fs/promises';
import { NextRequest } from 'next/server';
import path from 'path';
import { expect, test } from 'vitest';
import type { z } from 'zod';
import type {
  MaybeId,
  frourioSpec as querySpec,
  SymbolId,
  ZodId,
} from '../projects/basic/app/(group1)/[pid]/frourio';
import * as queryRoute from '../projects/basic/app/(group1)/[pid]/route';
import * as numberRoute from '../projects/basic/app/(group1)/blog/[...slug]/route';
import * as stringRoute from '../projects/basic/app/(group1)/blog/hoge/[[...fuga]]/route';
import * as paramsRoute from '../projects/basic/app/[a]/[b]/[...c]/route';
import * as baseRoute from '../projects/basic/app/route';
import * as formResRoute from '../projects/src-dir/src/app/%E6%97%A5%E6%9C%AC%E8%AA%9E/route';
import type { frourioSpec as formSpec } from '../projects/src-dir/src/app/frourio';
import * as formReqRoute from '../projects/src-dir/src/app/route';
import { SERVER_FILE } from '../src/constants';
import { generate } from '../src/generate';
import { listFrourioDirs } from '../src/listFrourioDirs';
import { generateOpenapi } from '../src/openapi/generateOpenapi';
import { getOpenapiConfig } from '../src/openapi/getOpenapiConfig';

test('generate', async () => {
  const projectDirs = fs
    .readdirSync('./projects', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join('./projects', d.name));

  await Promise.all(
    projectDirs.map(async (dir) => {
      const { appDir, output } = getOpenapiConfig(undefined, dir);

      assert(appDir);

      const frourioDirs = listFrourioDirs(appDir);

      await Promise.all(frourioDirs.map((dir) => unlink(path.join(dir, SERVER_FILE))));
      await generate(appDir);
      await generateOpenapi(appDir, output);
    }),
  );

  const out = execSync('git status', { encoding: 'utf8' });

  expect(out).toMatch('nothing to commit, working tree clean');
}, 20000);

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
  const res = await paramsRoute.POST(new NextRequest('http://example.com/aaa/bbb/ccc'), {
    params: Promise.resolve({ a: '111', b: 'bbb', c: ['ccc'] }),
  });

  await expect(res.json()).resolves.toEqual({ value: [111, 'bbb', 'ccc'] });
});

test('response string or number', async () => {
  const res1 = await stringRoute.GET(new NextRequest('http://example.com/blog/hoge/aaa'), {
    params: Promise.resolve({ fuga: ['aaa'] }),
  });

  await expect(res1.text()).resolves.toEqual('aaa');

  const res2 = await numberRoute.GET(new NextRequest('http://example.com/blog/123/456'), {
    params: Promise.resolve({ slug: ['123', '456'] }),
  });

  await expect(res2.json()).resolves.toEqual(123);
});

type Query = z.infer<typeof querySpec.get.query>;

test('query', async () => {
  await Promise.all(
    [
      {
        requiredNum: 1,
        requiredNumArr: [1, 2],
        id: '1',
        strArray: [],
        disable: 'false',
        bool: true,
        boolArray: [false, true],
        symbolIds: ['aaa' as SymbolId],
        optionalZodIds: [1 as ZodId],
        maybeIds: [0 as MaybeId],
      } satisfies Query,
      {
        requiredNum: 2,
        emptyNum: 0,
        requiredNumArr: [],
        id: '1',
        strArray: ['aa'],
        disable: 'false',
        bool: false,
        optionalBool: true,
        boolArray: [],
        optionalBoolArray: [true, false, false],
        symbolIds: [],
        maybeIds: [],
      } satisfies Query,
    ].map(async (val) => {
      const query = new URLSearchParams();

      Object.entries(val).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => query.append(key, String(item)));
        } else {
          query.set(key, String(value));
        }
      });

      const res = await queryRoute.GET(new NextRequest(`http://example.com/111?${query}`), {
        params: Promise.resolve({ pid: '111' }),
      });

      await expect(res.json()).resolves.toEqual({ pid: '111', query: val });
    }),
  );

  await Promise.all(
    [
      {
        requiredNum: 0,
        requiredNumArr: [],
        id: '1',
        disable: 'no boolean',
        bool: false,
        boolArray: [],
      },
      {
        requiredNum: 0,
        requiredNumArr: [],
        id: '2',
        disable: 'true',
        bool: false,
        boolArray: ['no boolean'],
      },
      {
        requiredNum: 0,
        requiredNumArr: ['no number'],
        id: '3',
        disable: 'true',
        bool: false,
        boolArray: [],
      },
      {
        requiredNum: 1,
        requiredNumArr: [1, 2],
        id: 'no number',
        disable: 'true',
        bool: false,
        boolArray: [],
      },
    ].map(async (val) => {
      const query = new URLSearchParams();

      Object.entries(val).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => query.append(key, String(item)));
        } else {
          query.set(key, String(value));
        }
      });

      const res = await queryRoute.GET(new NextRequest(`http://example.com/111?${query}`), {
        params: Promise.resolve({ pid: '111' }),
      });

      expect(res.status).toBe(422);
    }),
  );
});

type FormBody = z.infer<typeof formSpec.post.body>;

test('formData request', async () => {
  await Promise.all(
    [
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        optionalString: 'bbb',
        optionalNumber: 22,
        optionalBoolean: true,
        stringArr: ['cc', 'dd'],
        numberArr: [33, 44],
        booleanArr: [true, false],
        optionalStringArr: ['ee', 'ff'],
        optionalNumberArr: [55, 66],
        optionalBooleanArr: [false, true],
        file: new File(['test'], 'sample.txt'),
        optionalFile: new File(['foo'], 'baz.txt'),
        fileArr: [new File(['aaa'], 'aaa.txt'), new File(['bbb'], 'bbb.txt')],
        optionalFileArr: [new File(['ccc'], 'ccc.txt'), new File(['ddd'], 'ddd.txt')],
      } satisfies FormBody,
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        stringArr: [],
        numberArr: [33, 44],
        booleanArr: [true, false],
        file: new File(['test'], 'sample.txt'),
        fileArr: [],
      } satisfies FormBody,
    ].map(async (val) => {
      const formData = new FormData();

      Object.entries(val).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) =>
            item instanceof File
              ? formData.append(key, item, item.name)
              : formData.append(key, String(item)),
          );
        } else if (value instanceof File) {
          formData.set(key, value, value.name);
        } else {
          formData.set(key, String(value));
        }
      });

      const res = await formReqRoute.POST(
        new NextRequest('http://example.com/', { method: 'POST', body: formData }),
      );

      await expect(res.json()).resolves.toEqual({
        ...val,
        file: val.file.name,
        fileArr: val.fileArr.map((f) => f.name),
        optionalFile: val.optionalFile?.name,
        optionalFileArr: val.optionalFileArr?.map((f) => f.name),
      });
    }),
  );

  await Promise.all(
    [
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        stringArr: [],
        numberArr: ['no number'],
        booleanArr: [true, false],
        file: new File(['test'], 'sample.txt'),
        fileArr: [new File(['aaa'], 'aaa.txt')],
      },
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        stringArr: [],
        numberArr: [33, 44],
        booleanArr: [true, false],
        file: 123,
      },
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        stringArr: [],
        numberArr: [33, 44],
        booleanArr: ['no boolean'],
        file: new File(['test'], 'sample.txt'),
        fileArr: [],
      },
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        stringArr: [],
        numberArr: [33, 44],
        booleanArr: [true, false],
        file: new File(['test'], 'sample.txt'),
        fileArr: ['no file'],
      },
    ].map(async (val) => {
      const formData = new FormData();

      Object.entries(val).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) =>
            item instanceof File
              ? formData.append(key, item, item.name)
              : formData.append(key, String(item)),
          );
        } else if (value instanceof File) {
          formData.set(key, value, value.name);
        } else {
          formData.set(key, String(value));
        }
      });

      const res = await formReqRoute.POST(
        new NextRequest('http://example.com/', { method: 'POST', body: formData }),
      );

      expect(res.status).toBe(422);
    }),
  );
});

test('formData response', async () => {
  await Promise.all(
    [
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        optionalString: 'bbb',
        optionalNumber: 22,
        optionalBoolean: true,
        stringArr: ['cc', 'dd'],
        numberArr: [33, 44],
        booleanArr: [true, false],
        optionalStringArr: ['ee', 'ff'],
        optionalNumberArr: [55, 66],
        optionalBooleanArr: [false, true],
        file: new File(['test'], 'sample.txt', { type: 'application/octet-stream' }),
        optionalFile: new File(['foo'], 'baz.txt', { type: 'application/octet-stream' }),
        fileArr: [
          new File(['aaa'], 'aaa.txt', { type: 'application/octet-stream' }),
          new File(['bbb'], 'bbb.txt', { type: 'application/octet-stream' }),
        ],
        optionalFileArr: [
          new File(['ccc'], 'ccc.txt', { type: 'application/octet-stream' }),
          new File(['ddd'], 'ddd.txt', { type: 'application/octet-stream' }),
        ],
      } satisfies FormBody,
      {
        string: 'aaa',
        number: 11,
        boolean: false,
        stringArr: [],
        numberArr: [33, 44],
        booleanArr: [true, false],
        file: new File(['test'], 'sample.txt', { type: 'application/octet-stream' }),
        fileArr: [],
      } satisfies FormBody,
    ].map(async (val) => {
      const reqFormData = new FormData();

      Object.entries(val).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) =>
            item instanceof File
              ? reqFormData.append(key, item, item.name)
              : reqFormData.append(key, String(item)),
          );
        } else if (value instanceof File) {
          reqFormData.set(key, value, value.name);
        } else {
          reqFormData.set(key, String(value));
        }
      });

      const res = await formResRoute.POST(
        new NextRequest('http://example.com/', { method: 'POST', body: reqFormData }),
      );

      const resFormData = await res.formData();

      expect({
        string: resFormData.get('string') ?? undefined,
        number: formDataToNum(resFormData.get('number') ?? undefined),
        boolean: formDataToBool(resFormData.get('boolean') ?? undefined),
        stringArr: resFormData.getAll('stringArr'),
        numberArr: formDataToNumArr(resFormData.getAll('numberArr')),
        booleanArr: formDataToBoolArr(resFormData.getAll('booleanArr')),
        file: resFormData.get('file') ?? undefined,
        fileArr: resFormData.getAll('fileArr'),
        optionalString: resFormData.get('optionalString') ?? undefined,
        optionalNumber: formDataToNum(resFormData.get('optionalNumber') ?? undefined),
        optionalBoolean: formDataToBool(resFormData.get('optionalBoolean') ?? undefined),
        optionalStringArr:
          resFormData.getAll('optionalStringArr').length > 0
            ? resFormData.getAll('optionalStringArr')
            : undefined,
        optionalNumberArr:
          formDataToNumArr(resFormData.getAll('optionalNumberArr')).length > 0
            ? formDataToNumArr(resFormData.getAll('optionalNumberArr'))
            : undefined,
        optionalBooleanArr:
          formDataToBoolArr(resFormData.getAll('optionalBooleanArr')).length > 0
            ? formDataToBoolArr(resFormData.getAll('optionalBooleanArr'))
            : undefined,
        optionalFile: resFormData.get('optionalFile') ?? undefined,
        optionalFileArr:
          resFormData.getAll('optionalFileArr').length > 0
            ? resFormData.getAll('optionalFileArr')
            : undefined,
      }).toEqual(val);
    }),
  );
});

const formDataToNum = (val: FormDataEntryValue | undefined) => {
  const num = Number(val);

  return isNaN(num) ? val : num;
};

const formDataToNumArr = (val: FormDataEntryValue[]) =>
  val.map((v) => {
    const numVal = Number(v);

    return isNaN(numVal) ? v : numVal;
  });

const formDataToBool = (val: FormDataEntryValue | undefined) =>
  val === 'true' ? true : val === 'false' ? false : val;

const formDataToBoolArr = (val: FormDataEntryValue[]) =>
  val.map((v) => (v === 'true' ? true : v === 'false' ? false : v));
