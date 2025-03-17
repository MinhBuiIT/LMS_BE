import NotificationModel from "../notification.model";

export const findNotificationById = async (id: string) => {
    return await NotificationModel.findById(id);
}