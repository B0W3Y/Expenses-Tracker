import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';

interface RequestSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Validates and coerces `req.body`, `req.query` and `req.params` against the
 * provided Zod schemas. On failure responds with 422 and the field errors.
 */
export const validate =
  (schemas: RequestSchemas) =>
  (req: Request, res: Response, next: NextFunction): void => {
    for (const key of ['body', 'query', 'params'] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        res.status(422).json({
          error: 'Validation failed',
          details: z.flattenError(result.error).fieldErrors,
        });
        return;
      }
      // `req.query`/`req.params` are read-only getters in Express 5, so assign
      // the parsed value onto the request via defineProperty-safe mutation.
      Object.assign(req, { [key]: result.data });
    }

    next();
  };
