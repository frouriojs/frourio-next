import { SERVER_FILE } from './constants';
import type { PropOption } from './getPropOptions';

export type ParamsInfo = {
  ancestorFrourio: string | undefined;
  middles: string[];
  current:
    | { name: string; param: PropOption | null; array: { isOptional: boolean } | undefined }
    | undefined;
};

const chunkToSlugName = (chunk: string) =>
  chunk.replaceAll('[', '').replace('...', '').replaceAll(']', '');

export const pathToParams = (
  frourioDirs: string[],
  dirPath: string,
  param: PropOption | null,
): ParamsInfo | undefined => {
  if (!dirPath.includes('[')) return undefined;

  const [tail, ...heads] = dirPath.split('/').reverse();
  const ancestorIndex = heads.findIndex((head, i) => {
    return head.startsWith('[') && frourioDirs.includes(heads.slice(i).reverse().join('/'));
  });

  return {
    ancestorFrourio:
      ancestorIndex !== -1
        ? `${[...Array(ancestorIndex + 2)].join('../')}${SERVER_FILE.replace('.ts', '')}`
        : undefined,
    middles: heads
      .slice(0, ancestorIndex)
      .filter((h) => h.startsWith('['))
      .map(chunkToSlugName),
    current: tail.startsWith('[')
      ? {
          name: chunkToSlugName(tail),
          param,
          array: tail.includes('...') ? { isOptional: tail.startsWith('[[') } : undefined,
        }
      : undefined,
  };
};

export const paramsToText = (params: ParamsInfo) => {
  const paramText = 'frourioSpec.param';
  const current = params.current
    ? `z.object({ '${params.current.name}': ${params.current.param ? (params.current.param.typeName === 'number' ? (params.current.param.isArray ? `paramToNumArr(${paramText})` : `paramToNum(${paramText})`) : paramText) : params.current.array ? `z.array(z.string())${params.current.array.isOptional ? '.optional()' : ''}` : 'z.string()'} })`
    : '';
  const ancestor = 'ancestorParamsSchema';
  const middles = `z.object({ ${params.middles.map((middle) => `'${middle}': z.string()`).join(', ')} })`;

  return `${current}${
    params.current && params.ancestorFrourio
      ? `.and(${ancestor})`
      : params.ancestorFrourio
        ? ancestor
        : ''
  }${params.middles.length === 0 ? '' : params.current || params.ancestorFrourio ? `.and(${middles})` : middles}`;
};
