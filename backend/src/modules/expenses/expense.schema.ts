import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be greater than 0')
    .max(99_999_999.99, 'Amount is too large'),
  description: z.string().trim().min(1, 'Description is required').max(255),
  expenseDate: z.coerce.date(),
  categoryId: z.uuid('Invalid category id'),
});

export const updateExpenseSchema = createExpenseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
);

export const expenseParamsSchema = z.object({
  id: z.uuid('Invalid expense id'),
});

export const listExpensesQuerySchema = z
  .object({
    categoryId: z.uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    search: z.string().trim().max(255).optional(),
    minAmount: z.coerce.number().nonnegative().optional(),
    maxAmount: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: '`from` must be before or equal to `to`',
    path: ['from'],
  });

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
