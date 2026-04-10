import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

export function errorHandlerMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message,
      errors: error.errors.length > 0 ? error.errors : undefined,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ocurrio un error inesperado al procesar la solicitud.',
  });
}
