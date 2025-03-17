import { Router } from 'express';
import {
  addUserIntoCourseController,
  changePasswordController,
  changeRoleUserController,
  disableUserController,
  getAllUserController,
  getUserInfoByEmailController,
  getUserInfoController,
  updateUserInfoController,
  uploadAvatarController
} from '~/controllers/user.controller';

import { authenticationMiddleware, disableMiddleware } from '~/middlewares/auth.middleware';
import permissionMiddleware from '~/middlewares/permission.middleware';
import catchError from '~/utils/catchError';

const routeUser = Router();

routeUser.put('/update-info', authenticationMiddleware, catchError(updateUserInfoController));
routeUser.put('/change-password', authenticationMiddleware, catchError(changePasswordController));
routeUser.put('/upload-avatar', authenticationMiddleware, catchError(uploadAvatarController));
routeUser.get('/info', authenticationMiddleware, catchError(getUserInfoController));
routeUser.get('/all', authenticationMiddleware, permissionMiddleware('admin'), catchError(getAllUserController));
routeUser.patch(
  '/change-role',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(changeRoleUserController)
);
routeUser.post(
  '/add-course',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(addUserIntoCourseController)
);
routeUser.patch(
  '/disable/:userId',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(disableUserController)
);

routeUser.post(
  '/info-by-email',
  authenticationMiddleware,
  permissionMiddleware('admin'),
  catchError(getUserInfoByEmailController)
);
export default routeUser;
