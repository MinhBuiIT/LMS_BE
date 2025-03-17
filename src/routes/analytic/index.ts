import { Router } from 'express';
import {
  getCourseAnalytic12MonthController,
  getOrderAnalytic12MonthController,
  getUserAnalytic12MonthController
} from '~/controllers/analytics.controller';
import { authenticationMiddleware } from '~/middlewares/auth.middleware';
import permissionMiddleware from '~/middlewares/permission.middleware';
import catchError from '~/utils/catchError';

const routeAnalytic = Router();

routeAnalytic.use(authenticationMiddleware, permissionMiddleware('admin'));
routeAnalytic.get('/user', catchError(getUserAnalytic12MonthController));
routeAnalytic.get('/course', catchError(getCourseAnalytic12MonthController));
routeAnalytic.get('/order', catchError(getOrderAnalytic12MonthController));

export default routeAnalytic;
