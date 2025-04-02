import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

// Re-use schemas or define specific ones if needed
const UserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  isAdmin: z.boolean().optional(),
});

const ErrorSchema = z.object({ message: z.string() });

export const frourioSpec = {
  // Define path parameter schema for this route segment ([userId])
  param: z.coerce.number().int(),

  put: {
    body: UserSchema.partial().omit({ id: true }), // Allow partial updates, exclude id
    res: {
      200: { body: UserSchema },
      404: { body: ErrorSchema },
    },
  },

  delete: {
    res: {
      204: {}, // No content
      404: { body: ErrorSchema },
    },
  },
} satisfies FrourioSpec;

export type User = z.infer<typeof UserSchema>; // Export type if needed elsewhere