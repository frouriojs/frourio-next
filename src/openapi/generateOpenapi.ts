/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import type { OpenAPIV3_1 } from 'openapi-types';
import path from 'path';
import ts from 'typescript';
import * as TJS from 'typescript-json-schema';
import { FROURIO_FILE, SERVER_FILE } from '../constants';
import { listFrourioFiles } from '../listFrourioFiles';

export const generateOpenapi = (appDir: string, output: string) => {
  const existingDoc: OpenAPIV3_1.Document | undefined = existsSync(output)
    ? JSON.parse(readFileSync(output, 'utf8'))
    : undefined;
  const template: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: `${output.split('/').at(-1)?.replace('.json', '')} api`, version: 'v0.0' },
    ...existingDoc,
    paths: {},
    components: {},
  };

  writeFileSync(output, toOpenAPI({ appDir, template }), 'utf8');
  console.log(`${output} was built successfully.`);
};

const toOpenAPI = (params: { appDir: string; template: OpenAPIV3_1.Document }): string => {
  const frourioFiles = listFrourioFiles(path.resolve(params.appDir));
  const typeFile = `import type { FrourioSpec } from '@frourio/next'
import type { z } from 'zod'
${frourioFiles
  .map((f, i) => `import type { frourioSpec as frourioSpec${i} } from '${f}'`)
  .join('\n')}

type InferType<T extends z.ZodTypeAny | undefined> = T extends z.ZodTypeAny ? z.infer<T> : undefined;

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type FrourioResponse = {
  [Status in \`\${2 | 4 | 5}\${Digit}\${Digit}\`]?: {
    headers?: z.ZodTypeAny;
    format?: 'formData';
    body?: z.ZodTypeAny;
  };
};

type ToRes<T extends FrourioResponse | undefined> = {[S in keyof T]: T[S] extends {} ? {
  [Key in keyof T[S]]: T[S][Key] extends z.ZodTypeAny ? InferType<T[S][Key]> : undefined
}: undefined }

type ToSpecType<T extends FrourioSpec> = {
  param: InferType<T['param']>;
  get: T['get'] extends {}
    ? {
        headers: InferType<T['get']['headers']>;
        query: InferType<T['get']['query']>;
        res: ToRes<T['get']['res']>;
      }
    : undefined;
  head: T['head'] extends {}
    ? {
        headers: InferType<T['head']['headers']>;
        query: InferType<T['head']['query']>;
        res: ToRes<T['head']['res']>;
      }
    : undefined;
  options: T['options'] extends {}
    ? {
        headers: InferType<T['options']['headers']>;
        query: InferType<T['options']['query']>;
        res: ToRes<T['options']['res']>;
      }
    : undefined;
  post: T['post'] extends {}
    ? {
        headers: InferType<T['post']['headers']>;
        query: InferType<T['post']['query']>;
        format: T['post']['format'];
        body: InferType<T['post']['body']>;
        res: ToRes<T['post']['res']>;
      }
    : undefined;
  put: T['put'] extends {}
    ? {
        headers: InferType<T['put']['headers']>;
        query: InferType<T['put']['query']>;
        format: T['put']['format'];
        body: InferType<T['put']['body']>;
        res: ToRes<T['put']['res']>;
      }
    : undefined;
  patch: T['patch'] extends {}
    ? {
        headers: InferType<T['patch']['headers']>;
        query: InferType<T['patch']['query']>;
        format: T['patch']['format'];
        body: InferType<T['patch']['body']>;
        res: ToRes<T['patch']['res']>;
      }
    : undefined;
  delete: T['delete'] extends {}
    ? {
        headers: InferType<T['delete']['headers']>;
        query: InferType<T['delete']['query']>;
        format: T['delete']['format'];
        body: InferType<T['delete']['body']>;
        res: ToRes<T['delete']['res']>;
      }
    : undefined;
};

type AllMethods = [${frourioFiles.map((_, i) => `ToSpecType<typeof frourioSpec${i}>`).join(', ')}]`;

  const typeFilePath = path.posix.join(params.appDir, `@openapi-${Date.now()}.ts`);

  writeFileSync(typeFilePath, typeFile, 'utf8');

  const configFileName = ts.findConfigFile(params.appDir, ts.sys.fileExists);
  const compilerOptions = configFileName
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(configFileName, ts.sys.readFile).config,
        ts.sys,
        params.appDir,
      )
    : undefined;

  const program = TJS.getProgramFromFiles([typeFilePath], compilerOptions?.options);
  const methodsSchema = TJS.generateSchema(program, 'AllMethods', { required: true });
  const doc: OpenAPIV3_1.Document = {
    ...params.template,
    paths: {},
    components: { schemas: methodsSchema?.definitions as any },
  };

  unlinkSync(typeFilePath);

  (methodsSchema?.items as TJS.Definition[])?.forEach((def, i) => {
    const parameters: {
      name: string;
      in: 'path' | 'query' | 'header';
      required: boolean;
      schema: any;
    }[] = [];
    const file = frourioFiles[i];
    const hasParams = file.includes('[');

    if (hasParams) {
      const paramsSchema = TJS.generateSchema(
        TJS.getProgramFromFiles(
          [file.replace(FROURIO_FILE, SERVER_FILE)],
          compilerOptions?.options,
        ),
        'ParamsType',
        { required: true },
      );

      parameters.push(
        ...Object.entries(paramsSchema!.properties!).map(([param, val]) => {
          return {
            name: param.replace('[', '').replace(']', '').replace('...', ''),
            in: 'path' as const,
            required: true,
            schema: param.includes('...') ? { type: 'string', pattern: '.+' } : val,
          };
        }),
      );
    }

    const apiPath =
      file
        .replace(/\[+\.*(.+?)]+/g, '{$1}')
        .replace(path.resolve(params.appDir).replaceAll('\\', '/'), '')
        .replace(`/${FROURIO_FILE}`, '') || '/';

    doc.paths![apiPath] = Object.entries(def.properties!).reduce((dict, [method, val]) => {
      if (method === 'param') return dict;

      const props = (val as TJS.Definition).properties as Record<string, TJS.Definition>;
      const methodParameters = [...parameters];

      if (props.query) {
        const def = methodsSchema?.definitions?.[
          props.query.$ref!.split('/').at(-1)!
        ] as TJS.Definition;

        methodParameters.push(
          ...Object.entries(def).map(([name, value]) => ({
            name,
            in: 'query' as const,
            required: props.query?.required?.includes(name) ?? false,
            schema: value,
          })),
        );
      }

      const reqFormat = props.format?.const as string;
      const headersDef =
        props.headers &&
        (methodsSchema?.definitions?.[props.headers.$ref!.split('/').at(-1)!] as TJS.Definition);

      if (headersDef) {
        methodParameters.push(
          ...Object.entries(headersDef).map(([name, value]) => ({
            name,
            in: 'header' as const,
            required: props.reqHeaders?.required?.includes(name) ?? false,
            schema: value,
          })),
        );
      }

      const reqContentType =
        ((headersDef?.properties?.['content-type'] as TJS.Definition)?.const as string) ??
        (reqFormat === 'formData' ? 'multipart/form-data' : 'application/json');

      const resDef =
        props.res &&
        (methodsSchema?.definitions?.[props.res.$ref!.split('/').at(-1)!] as TJS.Definition);

      return {
        ...dict,
        [method]: {
          parameters: methodParameters.length === 0 ? undefined : methodParameters,
          requestBody:
            props.reqBody === undefined
              ? undefined
              : { content: { [reqContentType]: { schema: props.reqBody } } },
          responses: resDef?.properties
            ? Object.entries(resDef.properties).reduce((dict, [status, statusObj]) => {
                const statusDef = methodsSchema?.definitions?.[
                  (statusObj as TJS.Definition).$ref!.split('/').at(-1)!
                ] as TJS.Definition;

                const resContentType =
                  (((
                    (statusDef.properties as Record<string, TJS.Definition>)?.headers?.properties?.[
                      'content-type'
                    ] as TJS.Definition
                  )?.const as string) ??
                  (statusDef.properties as Record<string, TJS.Definition>)?.format?.const ===
                    'formData')
                    ? 'multipart/form-data'
                    : 'application/json';

                const bodyDef = (statusDef.properties as Record<string, TJS.Definition>)?.body.$ref
                  ? (methodsSchema?.definitions?.[
                      (statusDef.properties as Record<string, TJS.Definition>).body
                        .$ref!.split('/')
                        .at(-1)!
                    ] as TJS.Definition)
                  : (statusDef.properties as Record<string, TJS.Definition>)?.body;

                return {
                  ...dict,
                  [status]: {
                    content: { [resContentType]: { schema: bodyDef ?? {} } },
                    headers: (statusDef.properties as Record<string, TJS.Definition>)?.headers,
                  },
                };
              }, {})
            : undefined,
        },
      };
    }, {});
  });

  return JSON.stringify(doc, null, 2).replaceAll('#/definitions', '#/components/schemas');
};
