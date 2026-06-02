import { NotificationModel } from "../models/index.js";

export async function getNotifications(userId: string) {
  const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
  return notifications.map((notification) => notification.toJSON());
}

export async function markNotificationRead(notificationId: string) {
  const notification = await NotificationModel.findByIdAndUpdate(
    notificationId,
    { readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new Error("Сповіщення не знайдено");
  }

  return notification.toJSON();
}
