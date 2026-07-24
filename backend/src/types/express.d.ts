import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware for protected routes. */
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
