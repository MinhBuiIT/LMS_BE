import { NextFunction, Request, Response } from 'express';
import { BadRequestResponse } from '~/core/error.response';
import { CreatedResponse, OKResponse } from '~/core/success.response';
import { IReview } from '~/models/reviews.model';
import { addReviewService, getAllReviewOfCourseService, relyReviewService } from '~/services/review.service';

export const addReviewController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as IReview;
  const user = (req as any).user;
  if (body.rating < 1 || body.rating > 5) {
    throw new BadRequestResponse('Rating must be between 1 and 5');
  }
  const data = await addReviewService(body, user._id);
  new CreatedResponse({ message: 'Review added', data: data }).send(res);
};

export const relyReviewController = async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId, text, courseId } = req.body;
  const user = (req as any).user;
  const result = await relyReviewService(reviewId, text, user._id, courseId);
  new CreatedResponse({ message: 'Review replied', data: result }).send(res);
};

export const getAllReviewOfCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId } = req.params;
  const limit = (req.query.limit as string) || '5';
  const page = (req.query.page as string) || '1';
  const result = await getAllReviewOfCourseService(courseId, Number(limit), Number(page));
  new OKResponse({ message: 'Get all review of course', data: result }).send(res);
};
