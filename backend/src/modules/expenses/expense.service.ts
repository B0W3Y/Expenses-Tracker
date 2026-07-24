import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from './expense.schema.js';

/** Ensures the given category exists and belongs to the user. */
const assertCategoryOwnership = async (userId: string, categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { userId: true },
  });
  if (!category || category.userId !== userId) {
    throw AppError.badRequest('Category not found or not owned by user');
  }
};

/** Fetches a single expense, enforcing ownership. */
const findOwnedExpense = async (userId: string, id: string) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense || expense.userId !== userId) {
    throw AppError.notFound('Expense not found');
  }
  return expense;
};

/** Lists expenses with filtering, pagination and a total. */
export const listExpenses = async (userId: string, query: ListExpensesQuery) => {
  const where: Prisma.ExpenseWhereInput = {
    userId,
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.search
      ? { description: { contains: query.search, mode: 'insensitive' } }
      : {}),
    ...(query.from || query.to
      ? {
          expenseDate: {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {}),
          },
        }
      : {}),
    ...(query.minAmount !== undefined || query.maxAmount !== undefined
      ? {
          amount: {
            ...(query.minAmount !== undefined ? { gte: query.minAmount } : {}),
            ...(query.maxAmount !== undefined ? { lte: query.maxAmount } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
};

export const getExpense = (userId: string, id: string) =>
  findOwnedExpense(userId, id);

export const createExpense = async (userId: string, input: CreateExpenseInput) => {
  await assertCategoryOwnership(userId, input.categoryId);
  return prisma.expense.create({
    data: { ...input, userId },
    include: { category: { select: { id: true, name: true, color: true, icon: true } } },
  });
};

export const updateExpense = async (
  userId: string,
  id: string,
  input: UpdateExpenseInput,
) => {
  await findOwnedExpense(userId, id);
  if (input.categoryId) {
    await assertCategoryOwnership(userId, input.categoryId);
  }
  return prisma.expense.update({
    where: { id },
    data: {
      // Only include fields that were actually provided (exactOptionalPropertyTypes).
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.expenseDate !== undefined ? { expenseDate: input.expenseDate } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
    },
    include: { category: { select: { id: true, name: true, color: true, icon: true } } },
  });
};

export const deleteExpense = async (userId: string, id: string) => {
  await findOwnedExpense(userId, id);
  await prisma.expense.delete({ where: { id } });
};

/** Aggregated spending grouped by category, for dashboard charts. */
export const summaryByCategory = async (userId: string) => {
  const grouped = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: { userId },
    _sum: { amount: true },
    _count: true,
  });

  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, color: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return grouped.map((row) => ({
    category: categoryMap.get(row.categoryId) ?? null,
    total: row._sum.amount?.toString() ?? '0',
    count: row._count,
  }));
};
