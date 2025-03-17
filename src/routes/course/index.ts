import { Router } from 'express';
import multerConfig from '~/config/multer';
import {
  addSectionCourseController,
  changeOrderLectureController,
  changeStatusCourseController,
  createCourseController,
  deleteVideoCourseController,
  editCourseController,
  editSectionCourseController,
  getAllCourseController,
  getCourseByIdUserNotPurchaseController,
  getCourseByIdUserPurchaseController,
  getCourseDetailController,
  getCourseListController,
  getCourseListPurchasedController,
  uploadVideoCourseController
} from '~/controllers/course.controller';
import { authenticationMiddleware, disableMiddleware } from '~/middlewares/auth.middleware';
import permissionMiddleware from '~/middlewares/permission.middleware';
import catchError from '~/utils/catchError';

const routeCourse = Router();

routeCourse.post(
  '/',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(createCourseController)
);

routeCourse.put(
  '/:id',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(editCourseController)
);

routeCourse.put(
  '/section/:id',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(editSectionCourseController)
);

routeCourse.post(
  '/add-section/:courseId',
  authenticationMiddleware,
  permissionMiddleware('admin'),
  catchError(addSectionCourseController)
);

routeCourse.post(
  '/lecture/change-order',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(changeOrderLectureController)
);

routeCourse.get('/not-purchased/:id', catchError(getCourseByIdUserNotPurchaseController));

routeCourse.get(
  '/purchased/:id',
  authenticationMiddleware,
  disableMiddleware,
  catchError(getCourseByIdUserPurchaseController)
);

routeCourse.get('/list', catchError(getCourseListController));

routeCourse.get(
  '/list-purchased',
  authenticationMiddleware,
  disableMiddleware,
  catchError(getCourseListPurchasedController)
);

routeCourse.get(
  '/all',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(getAllCourseController)
);

routeCourse.post(
  '/change-status/:id',
  authenticationMiddleware,
  permissionMiddleware('admin'),
  catchError(changeStatusCourseController)
);

// routeCourse.post(
//   '/generate-url',
//   authenticationMiddleware,
//   permissionMiddleware('admin'),
//   catchError(generateDataVideoCourseController)
// );

// routeCourse.post(
//   '/video-info',
//   authenticationMiddleware,
//   permissionMiddleware('admin'),
//   catchError(getInfoVideoCourseController)
// );

routeCourse.post(
  '/upload-video',
  authenticationMiddleware,
  permissionMiddleware('admin'),
  multerConfig.single('video'),
  catchError(uploadVideoCourseController)
);
routeCourse.post(
  '/delete-video',
  authenticationMiddleware,
  permissionMiddleware('admin'),
  catchError(deleteVideoCourseController)
);
routeCourse.get('/:id', authenticationMiddleware, permissionMiddleware('admin'), catchError(getCourseDetailController));

export default routeCourse;
