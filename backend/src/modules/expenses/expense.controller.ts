import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as expenseService from './expense.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await expenseService.listExpenses(req.user!.id, req.query as never);
  res.status(200).json(result);
});

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const result = await expenseService.summaryByCategory(req.user!.id);
  res.status(200).json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.getExpense(req.user!.id, (req.params['id'] as string));
  res.status(200).json(expense);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.createExpense(req.user!.id, req.body);
  res.status(201).json(expense);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.updateExpense(
    req.user!.id,
    (req.params['id'] as string),
    req.body,
  );
  res.status(200).json(expense);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.deleteExpense(req.user!.id, (req.params['id'] as string));
  res.status(204).send();
});
