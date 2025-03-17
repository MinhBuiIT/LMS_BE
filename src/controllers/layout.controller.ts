import { Request, Response } from 'express';
import { LayoutBody } from '~/@types/layout';
import { BadRequestResponse, NotFoundResponse } from '~/core/error.response';
import { CreatedResponse } from '~/core/success.response';
import { createLayoutService, getLayoutService, updateLayoutService } from '~/services/layout.service';

export const createLayoutController = async (req: Request, res: Response) => {
  const body = req.body as LayoutBody;
  if (!body.type) {
    throw new BadRequestResponse('Type is required');
  }
  const data = await createLayoutService(body);
  new CreatedResponse({ message: 'Create layout successfully', data }).send(res);
};

export const updateLayoutController = async (req: Request, res: Response) => {
  const body = req.body as LayoutBody;
  if (!body.type) {
    throw new BadRequestResponse('Type is required');
  }
  const data = await updateLayoutService(body);
  new CreatedResponse({ message: 'Update layout successfully', data }).send(res);
};

export const getLayoutController = async (req: Request, res: Response) => {
  const type = req.params.type;
  if (!type) {
    throw new BadRequestResponse('Type is required');
  }
  const data = await getLayoutService(type);
  if (!data) {
    throw new NotFoundResponse('Layout not found');
  }
  new CreatedResponse({ message: 'Get layout successfully', data }).send(res);
};
