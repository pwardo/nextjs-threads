import * as z from 'zod';

export const ThreadValidation = z.object({
  thread: z
    .string()
    .min(3, { message: 'Thread must be at least 3 characters' })
    .max(1000, { message: 'Thread must be at most 1000 characters' })
    .nonempty(),
  accountId: z.string()
});

