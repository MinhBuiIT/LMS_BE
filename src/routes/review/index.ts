import { Router } from 'express';
import {
  addReviewController,
  getAllReviewOfCourseController,
  relyReviewController
} from '~/controllers/review.controller';
import { authenticationMiddleware, disableMiddleware } from '~/middlewares/auth.middleware';
import permissionMiddleware from '~/middlewares/permission.middleware';
import catchError from '~/utils/catchError';

const routeReview = Router();

routeReview.post('/', authenticationMiddleware, disableMiddleware, catchError(addReviewController));
routeReview.post(
  '/reply',
  authenticationMiddleware,
  disableMiddleware,
  permissionMiddleware('admin'),
  catchError(relyReviewController)
);

routeReview.get('/course/:courseId', catchError(getAllReviewOfCourseController));

export default routeReview;
