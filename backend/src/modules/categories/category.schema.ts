import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a hex code, e.g. #FF5733');

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50),
  color: hexColor.optional(),
  icon: z.string().trim().max(50).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
);

export const categoryParamsSchema = z.object({
  id: z.uuid('Invalid category id'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
