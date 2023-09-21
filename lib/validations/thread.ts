import * as z from 'zod';

export const ThreadValidation = z.object({
  thread: z
    .string()
    .min(3, { message: 'Thread must be at least 3 characters' })
    .max(50, { message: 'Thread must be at most 50 characters' })
    .nonempty(),
  accountId: z.string()
});

