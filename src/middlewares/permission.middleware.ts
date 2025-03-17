import { NextFunction, Request, Response } from 'express';
import { ForbiddenResponse, UnauthorizedResponse } from '~/core/error.response';

const permissionMiddleware = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next(new UnauthorizedResponse('Unauthorized'));
    }
    if (user.role.toLowerCase() !== permission.toLowerCase()) {
      return next(new ForbiddenResponse('You do not have permission to access this resource'));
    }
    return next();
  };
};

export default permissionMiddleware;
