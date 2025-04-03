import type { FrourioClientOption } from '@frourio/next';
import { z } from 'zod';
import { fc_13e9lnf, $fc_13e9lnf } from './x/[y]/frourio.client';
import { frourioSpec } from './frourio'

export const fc_17lcihw = (option?: FrourioClientOption) => ({
  'x/[y]': fc_13e9lnf(option),
  $url: $url(option),
  ...methods(option),
});

export const $fc_17lcihw = (option?: FrourioClientOption) => ({
  'x/[y]': $fc_13e9lnf(option),
  $url: {
  },
});

const $url = (option?: FrourioClientOption) => ({
});

const methods = (option?: FrourioClientOption) => ({
});
