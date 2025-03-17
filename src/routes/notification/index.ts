import { Router } from 'express';
import {
  getAllNotiController,
  updateStatusAllNotiController,
  updateStatusNotiController
} from '~/controllers/notification.controller';
import { authenticationMiddleware, disableMiddleware } from '~/middlewares/auth.middleware';
import permissionMiddleware from '~/middlewares/permission.middleware';
import catchError from '~/utils/catchError';

const routeNotification = Router();

routeNotification.get(
  '/',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(getAllNotiController)
);
routeNotification.patch(
  '/all',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(updateStatusAllNotiController)
);
routeNotification.patch(
  '/:notiId',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(updateStatusNotiController)
);

export default routeNotification;
