import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

const symbolBrand = Symbol();

export type SymbolId = string & { [symbolBrand]: unknown };

export type ZodId = number & z.BRAND<'ZodId'>;

export type MaybeId = ZodId | (number & z.BRAND<'maybe'>);

export const frourioSpec = {
  get: {
    query: z.object({
      requiredNum: z.number(),
      optionalNum: z.number().optional(),
      optionalNumArr: z.array(z.number()).optional(),
      emptyNum: z.number().optional(),
      requiredNumArr: z.array(z.number()),
      id: z.string(),
      strArray: z.array(z.string()),
      optionalStrArray: z.array(z.string()).optional(),
      disable: z.string(),
      bool: z.boolean(),
      optionalBool: z.boolean().optional(),
      boolArray: z.array(z.boolean()),
      optionalBoolArray: z.array(z.boolean()).optional(),
      symbolIds: z.array(z.string().transform(v => v as SymbolId)),
      optionalZodIds: z.array(z.number().transform(v => v as ZodId)).optional(),
      maybeIds: z.array(z.number().transform(v => v as MaybeId))
    }),
    res: { 200: { body: z.string() } },
  },
} satisfies FrourioSpec;
