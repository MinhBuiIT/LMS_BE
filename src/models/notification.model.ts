import { Document, ObjectId, Schema, model } from 'mongoose';

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read'
}

export interface INotification extends Document {
  userId: ObjectId;
  message: string;
  title: string;
  status: NotificationStatus;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.UNREAD }
  },
  { timestamps: true, collection: 'notifications' }
);

const NotificationModel = model<INotification>('Notification', notificationSchema);

export default NotificationModel;
