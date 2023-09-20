import * as z from 'zod';

export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(50, { message: 'Name must be at most 50 characters' })
    .nonempty(),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be at most 50 characters' }),
  bio: z
    .string()
    .min(3, { message: 'Bio must be at least 3 characters' })
    .max(50, { message: 'Bio must be at most 1000 characters' })
});