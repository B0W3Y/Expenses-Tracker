import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/** 404 handler for unmatched routes. */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

/**
 * Central error handler. Maps known error types (AppError, Prisma) to clean
 * HTTP responses and hides internal details in production.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by Express to detect an error handler
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'A record with this value already exists' });
      return;
    }
    if (err.code === 'P2003' || err.code === 'P2025') {
      res.status(404).json({ error: 'Related record not found' });
      return;
    }
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(env.NODE_ENV === 'development' && err instanceof Error
      ? { message: err.message }
      : {}),
  });
};
