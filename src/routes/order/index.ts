import { Router } from 'express';
import {
  createOrderController,
  getAllOrderController,
  getPublishKeyStripeController,
  newPaymentStripeController
} from '~/controllers/order.controller';
import { authenticationMiddleware, disableMiddleware } from '~/middlewares/auth.middleware';
import permissionMiddleware from '~/middlewares/permission.middleware';
import catchError from '~/utils/catchError';

const routeOrder = Router();

routeOrder.post('/', authenticationMiddleware, disableMiddleware, catchError(createOrderController));
routeOrder.get(
  '/all',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(getAllOrderController)
);

routeOrder.get('/stripe-key', catchError(getPublishKeyStripeController));

routeOrder.post('/stripe-payment', authenticationMiddleware, disableMiddleware, catchError(newPaymentStripeController));

export default routeOrder;
