import { Response } from 'express';
import Notification from './notification.model';
import { AuthRequest } from '../../types';
import { emitToUser } from '../../realtime/socket';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user?.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: req.user?.id }),
    Notification.countDocuments({ recipient: req.user?.id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Notifications fetched.',
    data: notifications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    unreadCount,
  });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user?.id },
    { isRead: true }
  );
  if (req.user?.id) emitToUser(req.user.id, 'notification:read', { id: req.params.id });
  res.status(200).json({ success: true, message: 'Marked as read.' });
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await Notification.updateMany(
    { recipient: req.user?.id, isRead: false },
    { isRead: true }
  );
  if (req.user?.id) emitToUser(req.user.id, 'notification:read-all', {});
  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user?.id });
  if (req.user?.id) emitToUser(req.user.id, 'notification:deleted', { id: req.params.id });
  res.status(200).json({ success: true, message: 'Notification deleted.' });
};
