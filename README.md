# NextFrourio

<br />
<img src="https://frouriojs.github.io/frourio/assets/images/ogp.png" width="1280" alt="frourio" />

<div align="center">
  <a href="https://www.npmjs.com/package/＠frourio/next">
    <img src="https://img.shields.io/npm/v/＠frourio/next" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/＠frourio/next">
    <img src="https://img.shields.io/npm/dm/＠frourio/next" alt="npm download" />
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

## Table of Contents

- [Install](#Install)
- [Command Line Interface Options](#CLI-options)
- [Setup](#Setup)
- [Usage](#Usage)
- [License](#License)

## Install

```sh
$ npm install next zod
$ npm install @frourio/next --save-dev
```

<a id="CLI-options"></a>

## Command Line Interface Options

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th width="100%">Description</th>
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

`app/<Route Handlers Dir>/frourio.ts` or `src/app/<Route Handlers Dir>/frourio.ts`

```ts
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  get: {
    headers: z.object({ cookie: z.string().optional() }),
    query: z.object({ aa: z.string() }),
    res: {
      200: { body: z.string() },
      201: { body: z.array(z.number()), headers: z.object({ 'Set-Cookie': z.string() }) },
      404: { body: z.undefined() },
    },
  },
  post: {
    body: z.object({ bb: z.number() }),
    res: {
      '200': { body: z.object({ cc: z.number() }) },
    },
  },
} satisfies FrourioSpec;
```

```sh
$ npm run dev # Automatically generate <Route Handlers Dir>/frourio.server.ts
```

`app/<Route Handlers Dir>/route.ts` or `src/app/<Route Handlers Dir>/route.ts`

```ts
import { createRoute } from './frourio.server';

export const { GET, POST } = createRoute({
  get: async () => ({ status: 200, body: 'ok' }),
  post: async ({ body }) => ({ status: 200, body: { cc: body.bb } }),
});
```

## License

NextFrourio is licensed under a [MIT License](https://github.com/frouriojs/next-frourio/blob/main/LICENSE).
