import { NextFunction, Request, Response } from 'express';

const catchError = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    return next(error);
  }
};

export default catchError;
