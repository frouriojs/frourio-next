import path from 'path';
import { CLIENT_FILE, CLIENT_NAME } from './constants';
import { createHash } from './createHash';
import type { DirSpec, HasParamsDict, MethodInfo } from './generate';
import type { ClientParamsInfo } from './paramsUtil';
import { clientParamsToText, pathToClientParams } from './paramsUtil';

export const generateClientTexts = (
  appDir: string,
  basePath: string | undefined,
  specs: DirSpec[],
  hasParamDict: HasParamsDict,
) => {
  const clientSpecs = specs.filter(({ spec }) => spec.methods.length > 0);
  const frourioClientDirs = clientSpecs.map(({ dirPath }) => dirPath);

  return clientSpecs.map(({ dirPath, spec }) => ({
    filePath: path.posix.join(dirPath, CLIENT_FILE),
    text: generateClient(
      appDir,
      dirPath,
      frourioClientDirs,
      pathToClientParams(hasParamDict, dirPath, spec.param),
      spec.methods,
      basePath,
    ),
  }));
};

const generateClient = (
  appDir: string,
  dirPath: string,
  frourioClientDirs: string[],
  params: ClientParamsInfo | undefined,
  methods: MethodInfo[],
  basePath: string | undefined,
) => {
  const childDirs = frourioClientDirs
    .filter((dir) => dir.startsWith(`${dirPath}/`))
    .map((dir) => ({
      import: dir.replace(`${dirPath}/`, ''),
      hash: createHash(dir.replace(appDir, '')),
    }))
    .filter((dir, _, arr) =>
      arr.every(
        (other) => !dir.import.startsWith(`${other.import}/`) || dir.import === other.import,
      ),
    );
  const imports: string[] = [
    "import type { FrourioClientOption } from '@frourio/next'",
    "import { z } from 'zod'",
    ...(params?.ancestors.map(
      ({ path }, n) => `import { frourioSpec as ancestorSpec${n} } from '${path}'`,
    ) ?? []),
    ...childDirs.map(
      (child) =>
        `import { ${CLIENT_NAME}_${child.hash}, $${CLIENT_NAME}_${child.hash} } from './${child.import}/${CLIENT_FILE.replace('.ts', '')}'`,
    ),
    "import { frourioSpec } from './frourio'",
  ];
  const relativePath = dirPath.replace(appDir, '');
  const apiPath =
    dirPath === appDir
      ? basePath || '/'
      : `${basePath ?? ''}${relativePath.replace(/\/\(.+?\)/g, '')}`;
  const currentHash = createHash(relativePath);
  const getMethod = methods.find((m) => m.name === 'get');
  const hasMethodReqKeys = (method: MethodInfo) => !!(params || method.hasHeaders || method.query);

  return `${imports.join(';\n')}

export const ${CLIENT_NAME} = (option?: FrourioClientOption) => ({${childDirs
    .map((child) => `\n  '${child.import}': ${CLIENT_NAME}_${child.hash}(option),`)
    .join('')}
  $url: $url(option),${
    getMethod
      ? hasMethodReqKeys(getMethod)
        ? `
  $build(req: Parameters<ReturnType<typeof methods>['$get']>[0] | null): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods>['$get']>>>>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '${relativePath || '/'}', ...rest }, () => ${CLIENT_NAME}(option).$get(req)];
  },`
        : `
  $build(req?: { init?: RequestInit }): [
    key: { lowLevel: true; baseURL: FrourioClientOption['baseURL']; dir: string },
    fetcher: () => Promise<NonNullable<Awaited<ReturnType<ReturnType<typeof methods>['$get']>>>>,
  ] {
    return [{ lowLevel: true, baseURL: option?.baseURL, dir: '${relativePath || '/'}' }, () => ${CLIENT_NAME}(option).$get(req)];
  },`
      : ''
  }
  ...methods(option),
});

export const $${CLIENT_NAME} = (option?: FrourioClientOption) => ({${childDirs
    .map((child) => `\n  '${child.import}': $${CLIENT_NAME}_${child.hash}(option),`)
    .join('')}
  $url: {${methods
    .map(
      (method) => `
    ${method.name}(${hasMethodReqKeys(method) ? `req: Parameters<ReturnType<typeof $url>['${method.name}']>[0]` : ''}): string {
      const result = $url(option).${method.name}(${hasMethodReqKeys(method) ? 'req' : ''});

      if (!result.isValid) throw result.reason;

      return result.data;
    },`,
    )
    .join('')}
  },${methods
    .map((method) => {
      const resType = method.res?.every((r) => !r.status.startsWith('2'))
        ? 'never'
        : !method.res
          ? 'Response'
          : [
              ...(method.res.some((r) => r.status.startsWith('2') && r.body)
                ? [
                    `z.infer<typeof frourioSpec.${method.name}.res[${method.res
                      .filter((r) => r.status.startsWith('2') && r.body)
                      .map((r) => r.status)
                      .join(' | ')}]['body']>`,
                  ]
                : []),
              ...(method.res.some((r) => r.status.startsWith('2') && !r.body) ? ['void'] : []),
            ].join(' | ');
      const builder =
        method.name === 'get'
          ? hasMethodReqKeys(method)
            ? `
  $build(req: Parameters<ReturnType<typeof methods>['$get']>[0] | null): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string } & Omit<Parameters<ReturnType<typeof methods>['$get']>[0], 'init'> | null,
    fetcher: () => Promise<${resType}>,
  ] {
    if (req === null) return [null, () => Promise.reject(new Error('Fetcher is disabled.'))];

    const { init, ...rest } = req;

    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '${relativePath || '/'}', ...rest }, () => $${CLIENT_NAME}(option).$get(req)];
  },`
            : `
  $build(req?: { init?: RequestInit }): [
    key: { lowLevel: false; baseURL: FrourioClientOption['baseURL']; dir: string },
    fetcher: () => Promise<${resType}>,
  ] {
    return [{ lowLevel: false, baseURL: option?.baseURL, dir: '${relativePath || '/'}' }, () => $${CLIENT_NAME}(option).$get(req)];
  },`
          : '';

      return `${builder}
  async $${method.name}(req${
    hasMethodReqKeys(method) || method.body ? '' : '?'
  }: Parameters<ReturnType<typeof methods>['$${method.name}']>[0]): Promise<${resType}> {
    const result = await methods(option).$${method.name}(req);

    if (!result.isValid) throw result.isValid === false ? result.reason : result.error;

    ${
      method.res?.every((r) => !r.status.startsWith('2'))
        ? 'throw new Error(`HTTP Error: ${result.failure.status}`);'
        : !method.res
          ? `if (!result.ok) throw new Error(\`HTTP Error: \${result.failure.status}\`);

    return result.data;`
          : `${
              method.res.some((r) => !r.status.startsWith('2'))
                ? `if (!result.ok) throw new Error(\`HTTP Error: \${result.failure.status}\`);\n\n    `
                : ''
            }return result.data.body;`
    }
  },`;
    })
    .join('')}
});

export const ${CLIENT_NAME}_${currentHash} = ${CLIENT_NAME};

export const $${CLIENT_NAME}_${currentHash} = $${CLIENT_NAME};
${params ? `\nconst paramsSchema = ${clientParamsToText(params)};\n` : ''}
const $url = (option?: FrourioClientOption) => ({${methods
    .map(
      (method) => `\n  ${method.name}(${
        params || method.query
          ? `req: { ${[
              ...(params ? ['params: z.infer<typeof paramsSchema>'] : []),
              ...(method.query ? [`query: z.infer<typeof frourioSpec.${method.name}.query>`] : []),
            ].join(',')} }`
          : ''
      }): { isValid: true; data: string; reason?: undefined } | { isValid: false, data?: undefined; reason: z.ZodError } {
${
  params
    ? `    const parsedParams = paramsSchema.safeParse(req.params);

    if (!parsedParams.success) return { isValid: false, reason: parsedParams.error };\n\n`
    : ''
}${
        method.query
          ? `    const parsedQuery = frourioSpec.${method.name}.query.safeParse(req.query);

    if (!parsedQuery.success) return { isValid: false, reason: parsedQuery.error };

    const searchParams = new URLSearchParams();

    Object.entries(parsedQuery.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    });\n\n`
          : ''
      }    return { isValid: true, data: \`\${option?.baseURL?.replace(/\\/$/, '') ?? ''}${
        params
          ? apiPath
              .replace(
                /\/\[\[\.\.\.(.+?)\]\]/,
                "${parsedParams.data.$1 !== undefined && parsedParams.data.$1.length > 0 ? `/${parsedParams.data.$1.join('/')}` : ''}",
              )
              .replace(/\[\.\.\.(.+?)\]/, "${parsedParams.data.$1.join('/')}")
              .replace(/\[(.+?)\]/g, '${parsedParams.data.$1}')
          : apiPath
      }${method.query ? `?\${searchParams.toString()}` : ''}\` };
  },`,
    )
    .join('')}
});

const methods = (option?: FrourioClientOption) => ({${methods
    .map((method) => {
      return `\n  async $${method.name}(req${
        params || method.hasHeaders || method.query || method.body ? '' : '?'
      }: { ${[
        ...(params ? ['params: z.infer<typeof paramsSchema>'] : []),
        ...(method.hasHeaders
          ? [`headers: z.infer<typeof frourioSpec.${method.name}.headers>`]
          : []),
        ...(method.query ? [`query: z.infer<typeof frourioSpec.${method.name}.query>`] : []),
        ...(method.body ? [`body: z.infer<typeof frourioSpec.${method.name}.body>`] : []),
        'init?: RequestInit',
      ].join(', ')} }): Promise<${
        !method.res
          ? `
    | { ok: true; isValid: true; data: Response; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }
    | { ok: false; isValid: true; data?: undefined; failure: Response; raw: Response; reason?: undefined; error?: undefined }`
          : `${
              method.res.some((r) => r.status.startsWith('2'))
                ? `\n    | { ok: true; isValid: true; data: ${method.res
                    .filter((r) => r.status.startsWith('2'))
                    .map(
                      (r) =>
                        `{ status: ${r.status}; headers${
                          r.hasHeaders
                            ? `: z.infer<typeof frourioSpec.${method.name}.res[${r.status}]['headers']>`
                            : '?: undefined'
                        }; body${
                          r.body
                            ? `: z.infer<typeof frourioSpec.${method.name}.res[${r.status}]['body']>`
                            : '?: undefined'
                        } }`,
                    )
                    .join(
                      ' | ',
                    )}; failure?: undefined; raw: Response; reason?: undefined; error?: undefined }`
                : ''
            }${
              method.res.some((r) => !r.status.startsWith('2'))
                ? `\n    | { ok: false; isValid: true; data?: undefined; failure: ${method.res
                    .filter((r) => !r.status.startsWith('2'))
                    .map(
                      (r) =>
                        `{ status: ${r.status}; headers${
                          r.hasHeaders
                            ? `: z.infer<typeof frourioSpec.${method.name}.res[${r.status}]['headers']>`
                            : '?: undefined'
                        }; body${
                          r.body
                            ? `: z.infer<typeof frourioSpec.${method.name}.res[${r.status}]['body']>`
                            : '?: undefined'
                        } }`,
                    )
                    .join(' | ')}; raw: Response; reason?: undefined; error?: undefined }`
                : ''
            }`
      }
    | { ok: boolean; isValid: false; data?: undefined; failure?: undefined; raw: Response; reason: z.ZodError; error?: undefined }
    | { ok: boolean; isValid?: undefined; data?: undefined; failure?: undefined; raw: Response; reason?: undefined; error: unknown }
    | { ok?: undefined; isValid: false; data?: undefined; failure?: undefined; raw?: undefined; reason: z.ZodError; error?: undefined }
    | { ok?: undefined; isValid?: undefined; data?: undefined; failure?: undefined; raw?: undefined; reason?: undefined; error: unknown }
  > {
    const url = $url(option).${method.name}(${hasMethodReqKeys(method) ? 'req' : ''});

    if (url.reason) return url;
${
  method.hasHeaders
    ? `\n    const parsedHeaders = frourioSpec.${method.name}.headers.safeParse(req.headers);

    if (!parsedHeaders.success) return { isValid: false, reason: parsedHeaders.error };\n`
    : ''
}${
        method.body
          ? `\n    const parsedBody = frourioSpec.${method.name}.body.safeParse(req.body);

    if (!parsedBody.success) return { isValid: false, reason: parsedBody.error };\n`
          : ''
      }${
        method.body?.isFormData
          ? `\n    const formData = new FormData();

    Object.entries(parsedBody.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach((item) =>
          item instanceof File
            ? formData.append(key, item, item.name)
            : formData.append(key, item.toString()),
        );
      } else if (value instanceof File) {
        formData.set(key, value, value.name);
      } else {
        formData.set(key, value.toString());
      }
    });\n`
          : ''
      }
    const fetchFn = option?.fetch ?? fetch;
    const result: { success: true; res: Response } | { success: false; error: unknown } = await fetchFn(
      url.data,
      {
        method: '${method.name.toUpperCase()}',
        ...option?.init,${
          method.body?.isFormData
            ? '\n        body: formData,'
            : method.body
              ? '\n        body: JSON.stringify(parsedBody.data),'
              : ''
        }
        ...req${params || method.hasHeaders || method.query || method.body ? '' : '?'}.init,
        headers: { ...option?.init?.headers, ${
          method.body?.isFormData === false ? "'content-type': 'application/json', " : ''
        }${method.hasHeaders ? '...parsedHeaders.data as HeadersInit, ' : ''}...req${
          params || method.hasHeaders || method.query || method.body ? '' : '?'
        }.init?.headers },
      }
    ).then(res => ({ success: true, res } as const)).catch(error => ({ success: false, error }));

    if (!result.success) return { error: result.error };

    ${
      method.res
        ? `switch (result.res.status) {${method.res
            .map(
              (item) => `\n      case ${item.status}: {${
                item.hasHeaders
                  ? `\n        const headers = frourioSpec.${method.name}.res[${item.status}].headers.safeParse(Object.fromEntries(result.res.headers.entries()));

        if (!headers.success) return { ok: ${item.status.startsWith('2')}, isValid: false, raw: result.res, reason: headers.error };\n`
                  : ''
              }${
                item.body
                  ? `\n        const resBody: { success: true; data: unknown } | { success: false; error: unknown } = await result.res.${
                      item.body.type
                    }().then(data => ({ success: true, data } as const)).catch(error => ({ success: false, error }));

        if (!resBody.success) return { ok: ${item.status.startsWith('2')}, raw: result.res, error: resBody.error };

        const body = frourioSpec.${method.name}.res[${item.status}].body.safeParse(resBody.data);

        if (!body.success) return { ok: ${item.status.startsWith('2')}, isValid: false, raw: result.res, reason: body.error };\n`
                  : ''
              }
        return {
          ok: ${item.status.startsWith('2')},
          isValid: true,
          ${item.status.startsWith('2') ? 'data' : 'failure'}: { status: ${item.status}${item.hasHeaders ? ', headers: headers.data' : ''}${item.body ? ', body: body.data' : ''} },
          raw: result.res,
        };
      }`,
            )
            .join('')}
      default:
        return { ok: result.res.ok, raw: result.res, error: new Error(\`Unknown status: \${result.res.status}\`) };
    }`
        : 'return result.res.ok ? { ok: true, isValid: true, data: result.res, raw: result.res } : { ok: false, isValid: true, failure: result.res, raw: result.res };'
    }
  },`;
    })
    .join('')}
});
`;
};
