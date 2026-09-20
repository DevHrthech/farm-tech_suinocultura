import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

export const notificationRoutes = Router();

notificationRoutes.get("/", NotificationController.list);
notificationRoutes.put("/read-all", NotificationController.markAllRead);
