import { z } from 'zod';
import { strongPasswordSchema } from '../auth/auth.validator.js';

export const createStaffSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: strongPasswordSchema,
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean flag is required' }),
});
