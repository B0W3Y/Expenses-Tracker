import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './category.schema.js';

/** Lists all categories owned by the user, with an expense count. */
export const listCategories = (userId: string) =>
  prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { expenses: true } } },
  });

/** Fetches a single category, enforcing ownership. */
const findOwnedCategory = async (userId: string, id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== userId) {
    throw AppError.notFound('Category not found');
  }
  return category;
};

export const createCategory = (userId: string, input: CreateCategoryInput) =>
  prisma.category.create({
    data: {
      name: input.name,
      userId,
      // Only include optional fields when actually provided (exactOptionalPropertyTypes).
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
    },
  });

export const updateCategory = async (
  userId: string,
  id: string,
  input: UpdateCategoryInput,
) => {
  await findOwnedCategory(userId, id);
  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
    },
  });
};

export const deleteCategory = async (userId: string, id: string) => {
  await findOwnedCategory(userId, id);

  const expenseCount = await prisma.expense.count({ where: { categoryId: id } });
  if (expenseCount > 0) {
    throw AppError.conflict(
      'Cannot delete a category that still has expenses. Reassign or delete them first.',
    );
  }

  await prisma.category.delete({ where: { id } });
};
