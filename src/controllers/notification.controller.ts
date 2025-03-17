import { Request, Response } from 'express';
import cron from 'node-cron';
import { BadRequestResponse } from '~/core/error.response';
import { OKResponse } from '~/core/success.response';
import NotificationModel, { NotificationStatus } from '~/models/notification.model';
import {
  getAllNotiService,
  updateStatusAllNotiService,
  updateStatusNotiService
} from '~/services/notification.service';

export const getAllNotiController = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const notiList = await getAllNotiService({ page: parseInt(page as string), limit: parseInt(limit as string) });

  new OKResponse({ message: 'Get all notification successfully', data: notiList }).send(res);
};

export const updateStatusNotiController = async (req: Request, res: Response) => {
  const { notiId } = req.params;
  if (!notiId) {
    throw new BadRequestResponse('Notification id is required');
  }
  await updateStatusNotiService(notiId);

  new OKResponse({ message: 'Update notification status successfully', data: null }).send(res);
};

export const updateStatusAllNotiController = async (req: Request, res: Response) => {
  await updateStatusAllNotiService();

  new OKResponse({ message: 'Update all notification status successfully', data: null }).send(res);
};

//Cron job delete notification every Sunday
cron.schedule('0 0 * * 7', async () => {
  await NotificationModel.deleteMany({ status: NotificationStatus.READ });
});
