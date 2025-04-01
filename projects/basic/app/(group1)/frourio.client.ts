import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { fc_rket09, $fc_rket09 } from './[pid]/frourio.client';
import { fc_er79ce, $fc_er79ce } from './blog/[...slug]/frourio.client';
import { fc_14jcy50, $fc_14jcy50 } from './blog/hoge/[[...fuga]]/frourio.client';
import { frourioSpec } from './frourio'

export const fc_82hx7j = (option?: FrourioClientOption) => ({
  '[pid]': fc_rket09(option),
  'blog/[...slug]': fc_er79ce(option),
  'blog/hoge/[[...fuga]]': fc_14jcy50(option),
  $path: $path(option),
  ...methods(option),
});

export const $fc_82hx7j = (option?: FrourioClientOption) => ({
  '[pid]': $fc_rket09(option),
  'blog/[...slug]': $fc_er79ce(option),
  'blog/hoge/[[...fuga]]': $fc_14jcy50(option),
  $path: {
  },
});

const $path = (option?: FrourioClientOption) => ({
});

const methods = (option?: FrourioClientOption) => ({
});
