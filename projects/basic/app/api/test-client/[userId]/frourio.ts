import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  isAdmin: z.boolean().optional(),
});

const ErrorSchema = z.object({ message: z.string() });

export const frourioSpec = {
  param: z.coerce.number().int(),

  put: {
    body: UserSchema.partial().omit({ id: true }),
    res: {
      200: { body: UserSchema },
      404: { body: ErrorSchema },
    },
  },

  delete: {
    res: {
      204: {},
      404: { body: ErrorSchema },
    },
  },
} satisfies FrourioSpec;
