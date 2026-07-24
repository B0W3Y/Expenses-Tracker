import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as categoryService from './category.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.listCategories(req.user!.id);
  res.status(200).json(categories);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.user!.id, req.body);
  res.status(201).json(category);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(
    req.user!.id,
    (req.params['id'] as string),
    req.body,
  );
  res.status(200).json(category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.user!.id, (req.params['id'] as string));
  res.status(204).send();
});
