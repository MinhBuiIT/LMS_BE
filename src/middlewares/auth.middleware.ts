import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedResponse } from '~/core/error.response';
import { redis } from '~/db/db.init';

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  const clientId = req.headers['client-id'] as string;
  //   console.log('cookie', token);
  //   console.log('clientId', clientId);

  if (!token) {
    return next(new UnauthorizedResponse('Unauthorized'));
  }
  if (!clientId) {
    return next(new UnauthorizedResponse('Client Id is required'));
  }
  let user = await redis.get(clientId);
  if (!user) {
    return next(new UnauthorizedResponse('Please login again'));
  }
  const userObj = JSON.parse(user);

  try {
    await jwt.verify(token, userObj.publicKey);
    (req as any).user = userObj;
    return next();
  } catch (error: any) {
    if (error?.name && error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedResponse(error.message));
    }

    next(error);
  }
};

export const disableMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { disabled } = (req as any)?.user;
  if (disabled) {
    return next(new UnauthorizedResponse('User is disabled'));
  }
  next();
};
