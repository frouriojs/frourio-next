import { FROURIO_FILE, SERVER_FILE } from './constants';
import type { PropOption } from './getPropOptions';

export type ParamsInfo = {
  ancestorFrourio: string | undefined;
  middleNames: string[];
  current:
    | { name: string; param: PropOption | null; array: { isOptional: boolean } | undefined }
    | undefined;
};

const chunkToSlugName = (chunk: string): string =>
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
    middleNames: heads
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

export type ClientParamsInfo = {
  ancestors: { name: string; path: string }[];
  middleNames: string[];
  current: ParamsInfo['current'];
};

export const pathToClientParams = (
  hasParamDict: Record<string, boolean>,
  dirPath: string,
  param: PropOption | null,
): ClientParamsInfo | undefined => {
  if (!dirPath.includes('[')) return undefined;

  const [tail, ...heads] = dirPath.split('/').reverse();
  const ancestors = heads.flatMap((head, i) => {
    return head.startsWith('[') && hasParamDict[heads.slice(i).reverse().join('/')]
      ? {
          name: chunkToSlugName(head),
          path: `${[...Array(i + 2)].join('../')}${FROURIO_FILE.replace('.ts', '')}`,
        }
      : [];
  });
  const middleNames = heads
    .filter((head, i) => {
      return head.startsWith('[') && !hasParamDict[heads.slice(i).reverse().join('/')];
    })
    .map(chunkToSlugName);

  return {
    ancestors,
    middleNames,
    current: tail.startsWith('[')
      ? {
          name: chunkToSlugName(tail),
          param,
          array: tail.includes('...') ? { isOptional: tail.startsWith('[[') } : undefined,
        }
      : undefined,
  };
};

export const paramsToText = (params: ParamsInfo): string => {
  const ancestor = 'ancestorParamsSchema';
  const paramText = 'frourioSpec.param';
  const current = params.current
    ? `z.object({ '${params.current.name}': ${params.current.param ? (params.current.param.typeName === 'number' ? (params.current.param.isArray ? `paramToNumArr(${paramText})` : `paramToNum(${paramText})`) : paramText) : params.current.array ? `z.array(z.string())${params.current.array.isOptional ? '.optional()' : ''}` : 'z.string()'} })`
    : '';
  const middles = `z.object({ ${params.middleNames.map((middle) => `'${middle}': z.string()`).join(', ')} })`;

  return `${current}${
    params.current && params.ancestorFrourio
      ? `.and(${ancestor})`
      : params.ancestorFrourio
        ? ancestor
        : ''
  }${params.middleNames.length === 0 ? '' : params.current || params.ancestorFrourio ? `.and(${middles})` : middles}`;
};

export const clientParamsToText = (params: ClientParamsInfo): string => {
  return `z.object({ ${[
    ...params.ancestors.map(({ name }, n) => `'${name}': ancestorSpec${n}.param`),
    ...params.middleNames.map((name) => `'${name}': z.string()`),
    ...(params.current
      ? [
          `'${params.current.name}': ${
            params.current.param
              ? 'frourioSpec.param'
              : params.current.array
                ? `z.array(z.string())${params.current.array.isOptional ? '.optional()' : ''}`
                : 'z.string()'
          }`,
        ]
      : []),
  ].join(', ')} })`;
};
