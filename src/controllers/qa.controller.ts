import { NextFunction, Request, Response } from 'express';
import { BadRequestResponse } from '~/core/error.response';
import { CreatedResponse, OKResponse } from '~/core/success.response';
import {
  createQAService,
  deleteQAService,
  getQAListByParentService,
  getQAListLevelZeroService
} from '~/services/qa.service';

export const createQAController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const user = (req as any).user;

  const newQA = await createQAService({ ...body, qaUser: user._id });
  new CreatedResponse({ message: 'QA created', data: newQA }).send(res);
};
export const getQAListLevelZeroController = async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const courseDataId = req.params.courseDataId;
  const page = query.page ? parseInt(query.page as string) : 1;
  const limit = query.limit ? parseInt(query.limit as string) : 10;
  const data = await getQAListLevelZeroService({ courseDataId, page, limit });
  new OKResponse({ message: 'Get QA list successfully', data }).send(res);
};

export const getQAListChildrenController = async (req: Request, res: Response, next: NextFunction) => {
  const qaId = req.params.qaId;
  if (!qaId) {
    return next(new BadRequestResponse('Invalid QA id'));
  }
  const data = await getQAListByParentService({ qaParentId: qaId });
  new OKResponse({ message: 'Get QA children list successfully', data }).send(res);
};

export const deleteQAController = async (req: Request, res: Response, next: NextFunction) => {
  const qaId = req.params.qaId;
  const user = (req as any).user;
  if (!qaId) {
    return next(new BadRequestResponse('Invalid QA id'));
  }
  await deleteQAService({ qaId, user: user._id });
  new OKResponse({ message: 'QA deleted', data: null }).send(res);
};
