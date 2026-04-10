import { Request, Response } from 'express';

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({
    code: 'ROUTE_NOT_FOUND',
    message: 'La ruta solicitada no existe.',
  });
}
