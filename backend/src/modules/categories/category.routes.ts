import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as categoryController from './category.controller.js';
import {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from './category.schema.js';

export const categoryRouter = Router();

// Every category route requires authentication.
categoryRouter.use(authenticate);

categoryRouter.get('/', categoryController.list);

categoryRouter.post(
  '/',
  validate({ body: createCategorySchema }),
  categoryController.create,
);

categoryRouter.patch(
  '/:id',
  validate({ params: categoryParamsSchema, body: updateCategorySchema }),
  categoryController.update,
);

categoryRouter.delete(
  '/:id',
  validate({ params: categoryParamsSchema }),
  categoryController.remove,
);
