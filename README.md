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

- **Type safety**. Automatically generate type definition files for manipulating internal links in Next.js.
- **Zero configuration**. No configuration required can be used immediately after installation.
- **Zero runtime**. Lightweight because runtime code is not included in the bundle.

## Table of Contents

- [Install](#Install)
- [Command Line Interface Options](#CLI-options)
- [Setup](#Setup)
- [Usage](#Usage)
- [Define query](#Define-query)
- [License](#License)

## Install

```sh
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
      <td nowrap><code>--output</code><br /><code>-o</code></td>
      <td><code>string</code></td>
      <td>Specify the output directory for <code>$path.ts</code>.</td>
    </tr>
    <tr>
      <td nowrap><code>--watch</code><br /><code>-w</code></td>
      <td></td>
      <td>
        Enable watch mode.<br />
        Regenerate <code>$path.ts</code>.
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
    "dev:path": "pathpida --ignorePath .gitignore --watch",
    "build": "pathpida --ignorePath .gitignore && next build"
  }
}
```

## Usage

```
pages/index.tsx
pages/post/create.tsx
pages/post/[pid].tsx
pages/post/[...slug].tsx

lib/$path.ts or utils/$path.ts // Generated automatically by pathpida
```

or

```
src/pages/index.tsx
src/pages/post/create.tsx
src/pages/post/[pid].tsx
src/pages/post/[...slug].tsx

src/lib/$path.ts or src/utils/$path.ts // Generated automatically by pathpida
```

`pages/index.tsx`

```tsx
import Link from 'next/link';
import { pagesPath } from '../lib/$path';

console.log(pagesPath.post.create.$url()); // { pathname: '/post/create' }
console.log(pagesPath.post._pid(1).$url()); // { pathname: '/post/[pid]', query: { pid: 1 }}
console.log(pagesPath.post._slug(['a', 'b', 'c']).$url()); // { pathname: '/post//[...slug]', query: { slug: ['a', 'b', 'c'] }}

export default () => {
  const onClick = useCallback(() => {
    router.push(pagesPath.post._pid(1).$url());
  }, []);

  return (
    <>
      <Link href={pagesPath.post._slug(['a', 'b', 'c']).$url()} />
      <div onClick={onClick} />
    </>
  );
};
```

<a id="Define-query"></a>

## Define query

`pages/post/create.tsx`

```tsx
export type Query = {
  userId: number;
  name?: string;
};

export default () => <div />;
```

`pages/post/[pid].tsx`

```tsx
export type OptionalQuery = {
  limit: number;
  label?: string;
};

export default () => <div />;
```

`pages/index.tsx`

```tsx
import Link from 'next/link';
import { pagesPath } from '../lib/$path';

console.log(pagesPath.post.create.$url({ query: { userId: 1 } })); // { pathname: '/post/create', query: { userId: 1 }}
console.log(pagesPath.post.create.$url()); // type error
console.log(pagesPath.post._pid(1).$url()); // { pathname: '/post/[pid]', query: { pid: 1 }}
console.log(pagesPath.post._pid(1).$url({ query: { limit: 10 }, hash: 'sample' })); // { pathname: '/post/[pid]', query: { pid: 1, limit: 10 }, hash: 'sample' }

export default () => {
  const onClick = useCallback(() => {
    router.push(pagesPath.post._pid(1).$url());
  }, []);

  return (
    <>
      <Link href={pagesPath.post._slug(['a', 'b', 'c']).$url()} />
      <div onClick={onClick} />
    </>
  );
};
```

## License

pathpida is licensed under a [MIT License](https://github.com/aspida/pathpida/blob/master/LICENSE).
