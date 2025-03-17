import { BadRequestResponse } from '~/core/error.response';
import NotificationModel, { NotificationStatus } from '~/models/notification.model';
import { findNotificationById } from '~/models/repository/notification.repo';

// For Admin
export const getAllNotiService = async ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => {
  const notiList = await NotificationModel.find({ status: NotificationStatus.UNREAD })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await NotificationModel.countDocuments({ status: NotificationStatus.UNREAD });
  return {
    notiList,
    total,
    page,
    limit
  };
};

//For Admin
export const updateStatusNotiService = async (notiId: string) => {
  const noti = await findNotificationById(notiId);
  if (!noti) {
    throw new BadRequestResponse('Notification not found');
  }
  noti.status = NotificationStatus.READ;
  await noti.save();
};

//For Admin
export const updateStatusAllNotiService = async () => {
  await NotificationModel.updateMany({ status: NotificationStatus.UNREAD }, { status: NotificationStatus.READ });
};
