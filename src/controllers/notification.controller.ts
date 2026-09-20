import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { NotificationModel } from "../models/notification.model";

export const NotificationController = {
  list: async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const [notifications, unreadCount] = await Promise.all([
      NotificationModel.listForUser(userId),
      NotificationModel.unreadCount(userId),
    ]);
    res.json({ notifications, unreadCount });
  },

  markAllRead: async (req: AuthRequest, res: Response) => {
    await NotificationModel.markAllRead(req.user!.userId);
    res.status(204).send();
  },
};
