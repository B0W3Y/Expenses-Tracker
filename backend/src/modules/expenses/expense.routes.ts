import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as expenseController from './expense.controller.js';
import {
  createExpenseSchema,
  expenseParamsSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from './expense.schema.js';

export const expenseRouter = Router();

expenseRouter.use(authenticate);

expenseRouter.get(
  '/',
  validate({ query: listExpensesQuerySchema }),
  expenseController.list,
);

expenseRouter.get('/summary', expenseController.summary);

expenseRouter.post(
  '/',
  validate({ body: createExpenseSchema }),
  expenseController.create,
);

expenseRouter.get(
  '/:id',
  validate({ params: expenseParamsSchema }),
  expenseController.getOne,
);

expenseRouter.patch(
  '/:id',
  validate({ params: expenseParamsSchema, body: updateExpenseSchema }),
  expenseController.update,
);

expenseRouter.delete(
  '/:id',
  validate({ params: expenseParamsSchema }),
  expenseController.remove,
);
