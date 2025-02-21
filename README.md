# FrourioNext

<br />
<img src="https://frouriojs.github.io/frourio/assets/images/ogp.png" width="1280" alt="frourio" />

<div align="center">
  <a href="https://www.npmjs.com/package/@frourio/next">
    <img src="https://img.shields.io/npm/v/@frourio/next" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@frourio/next">
    <img src="https://img.shields.io/npm/dm/@frourio/next" alt="npm download" />
  </a>
</div>
<br />
<p align="center">Next.js Route Handlers helper with runtime validation and type-safe clients.</p>
<br />
<br />

## Features

- **Type safety**. Automatically generate type definition files for Next.js Route Handlers.
- **Zero configuration**. No configuration required can be used immediately after installation.
- **Zero runtime**. Lightweight because runtime code is not included in the bundle.

## Install

```sh
$ npm install next zod
$ npm install @frourio/next npm-run-all --save-dev
```

<a id="CLI-options"></a>

## Command Line Interface Options

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td nowrap><code>--watch</code><br /><code>-w</code></td>
      <td></td>
      <td>
        Enable watch mode.<br />
        Regenerate <code>frourio.server.ts</code>.
      </td>
    </tr>
  </tbody>
</table>

## Setup

`package.json`

```json
{
  "scripts": {
    "dev": "run-p dev:*",
    "dev:next": "next dev",
    "dev:frourio": "frourio-next --watch",
    "build": "frourio-next && next build"
  }
}
```

## Usage

`app/api/[slug]/frourio.ts`

```ts
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  param: z.string(),
  get: {
    headers: z.object({ cookie: z.string().optional() }),
    query: z.object({
      string: z.string(),
      number: z.number(),
      boolean: z.boolean(),
      optionalString: z.string().optional(),
      optionalNumber: z.number().optional(),
      optionalBoolean: z.boolean().optional(),
      stringArr: z.array(z.string()),
      numberArr: z.array(z.number()),
      booleanArr: z.array(z.boolean()),
      optionalStringArr: z.array(z.string()).optional(),
      optionalNumberArr: z.array(z.number()).optional(),
      optionalBooleanArr: z.array(z.boolean()).optional(),
    }),
    res: {
      200: { body: z.object({ bb: z.array(z.string()) }) },
      404: { body: z.undefined() },
    },
  },
  post: {
    body: z.object({ bb: z.number() }),
    res: {
      201: {
        body: z.array(z.number()),
        headers: z.object({ 'Set-Cookie': z.string() }),
      },
    },
  },
} satisfies FrourioSpec;
```

```sh
$ npm run dev # Automatically generate app/api/[slug]/frourio.server.ts
```

`app/api/[slug]/route.ts`

```ts
import { createRoute } from './frourio.server';

export const { GET, POST } = createRoute({
  get: async ({ params, query }) => {
    return { status: 200, body: { bb: [params.slug, query.string] } };
  },
  post: async ({ params, body }) => {
    return { status: 201, body: [body.bb], headers: { 'Set-Cookie': params.slug } };
  },
});
```

## FormData

`app/api/file/frourio.ts`

```ts
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  post: {
    format: 'formData',
    body: z.object({
      string: z.string(),
      number: z.number(),
      boolean: z.boolean(),
      optionalString: z.string().optional(),
      optionalNumber: z.number().optional(),
      optionalBoolean: z.boolean().optional(),
      stringArr: z.array(z.string()),
      numberArr: z.array(z.number()),
      booleanArr: z.array(z.boolean()),
      optionalStringArr: z.array(z.string()).optional(),
      optionalNumberArr: z.array(z.number()).optional(),
      optionalBooleanArr: z.array(z.boolean()).optional(),
      file: z.instanceof(File),
      optionalFile: z.instanceof(File).optional(),
      fileArr: z.array(z.instanceof(File)),
      optionalFileArr: z.array(z.instanceof(File)).optional(),
    }),
    res: {
      200: {
        format: 'formData',
        body: z.object({
          string: z.string(),
          number: z.number(),
          boolean: z.boolean(),
          optionalString: z.string().optional(),
          optionalNumber: z.number().optional(),
          optionalBoolean: z.boolean().optional(),
          stringArr: z.array(z.string()),
          numberArr: z.array(z.number()),
          booleanArr: z.array(z.boolean()),
          optionalStringArr: z.array(z.string()).optional(),
          optionalNumberArr: z.array(z.number()).optional(),
          optionalBooleanArr: z.array(z.boolean()).optional(),
          file: z.instanceof(File),
          optionalFile: z.instanceof(File).optional(),
          fileArr: z.array(z.instanceof(File)),
          optionalFileArr: z.array(z.instanceof(File)).optional(),
        }),
      },
    },
  },
} satisfies FrourioSpec;
```

```sh
$ npm run dev # Automatically generate app/api/file/frourio.server.ts
```

`app/api/file/route.ts`

```ts
import { createRoute } from './frourio.server';

export const { POST } = createRoute({
  post: async ({ body }) => {
    return { status: 200, body },
});
```

## LLM Streaming

`app/api/chat/frourio.ts`

If res property is not specified, any Response object can be returned.

```ts
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  get: {
    query: z.object({ message: z.string() }),
  },
} satisfies FrourioSpec;
```

```sh
$ npm i ai @ai-sdk/openai --save-dev
$ npm run dev # Automatically generate app/api/chat/frourio.server.ts
```

`app/api/chat/route.ts`

```ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  get: async ({ query }) => {
    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: query.message }],
    });

    return result.toDataStreamResponse();
  },
});
```

## Test

`tests/index.spec.ts`

```ts
import { NextRequest } from 'next/server';
import { expect, test } from 'vitest';
import { GET, POST } from '../app/api/[slug]/route';

test('Route Handlers', async () => {
  const slug = 'foo';
  const query = 'bar';
  const params = Promise.resolve({ slug });
  const res1 = await GET(new NextRequest(`http://example.com/${slug}?aa=${query}`, { params }));

  await expect(res1.json()).resolves.toEqual({ bb: [slug, query] });

  const body = { bb: 3 };
  const res2 = await POST(
    new NextRequest(`http://example.com/${slug}`, {
      method: 'POST',
      params,
      body: JSON.stringify(body),
    }),
  );

  await expect(res2.json()).resolves.toEqual([body.bb]);

  expect(res2.headers.get('Set-Cookie')).toBe(slug);
});
```

## License

FrourioNext is licensed under a [MIT License](https://github.com/frouriojs/frourio-next/blob/main/LICENSE).
