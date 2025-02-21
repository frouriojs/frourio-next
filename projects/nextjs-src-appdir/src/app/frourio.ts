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
          file: z.string(),
          optionalFile: z.string().optional(),
          fileArr: z.array(z.string()),
          optionalFileArr: z.array(z.string()).optional(),
        }),
      },
    },
  },
} satisfies FrourioSpec;
