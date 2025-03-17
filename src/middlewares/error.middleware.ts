import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from '~/core/error.response';

const errorMiddleware = (error: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'ValidationError') {
    error.statusCode = 400;
  }
  if (error.name === 'TokenExpiredError') {
    error.statusCode = 401;
  }

  const message = error.message || 'Internal server error';
  const status = error.statusCode || 500;
  const errorDetail = error.error || null;

  if (errorDetail) {
    res.status(status).json({
      statusCode: status,
      message,
      error: errorDetail
    });
  } else {
    res.status(status).json({
      statusCode: status,
      message
    });
  }
};

export default errorMiddleware;
