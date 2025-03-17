import { Request, Response } from 'express';
import { OKResponse } from '~/core/success.response';
import Course from '~/models/course.model';
import OrderModel from '~/models/order.model';
import User from '~/models/user.model';
import generateAnalytic from '~/utils/analyticGenerate';

export const getUserAnalytic12MonthController = async (req: Request, res: Response) => {
  const result = await generateAnalytic(User);
  new OKResponse({ message: 'Get user analytic successfully', data: result }).send(res);
};

export const getCourseAnalytic12MonthController = async (req: Request, res: Response) => {
  const result = await generateAnalytic(Course);
  new OKResponse({ message: 'Get course analytic successfully', data: result }).send(res);
};

export const getOrderAnalytic12MonthController = async (req: Request, res: Response) => {
  const result = await generateAnalytic(OrderModel);
  new OKResponse({ message: 'Get order analytic successfully', data: result }).send(res);
};
