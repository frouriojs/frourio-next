import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';
import { AuthContextSchema } from '../frourio';

const AdminContextSchema = z.object({
  isAdmin: z.boolean(),
  permissions: z.array(z.string()),
});

export const frourioSpec = {
  middleware: {
    context: AdminContextSchema,
  },
  get: {
    res: {
      200: { body: AuthContextSchema.merge(AdminContextSchema) },
      403: { body: z.object({ message: z.string() }) },
    },
  },
  post: {
    body: z.object({ data: z.string() }),
    res: {
      201: { body: z.object({ received: z.string(), context: AuthContextSchema.merge(AdminContextSchema) }) },
      403: { body: z.object({ message: z.string() }) },
    },
  },
} satisfies FrourioSpec;
