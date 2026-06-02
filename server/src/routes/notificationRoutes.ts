import { Router } from "express";
import { getNotifications, markNotificationRead } from "../services/notificationService.js";

export const notificationRoutes = Router();

notificationRoutes.get("/:userId", async (request, response, next) => {
  try {
    response.json(await getNotifications(request.params.userId));
  } catch (error) {
    next(error);
  }
});

notificationRoutes.post("/:notificationId/read", async (request, response, next) => {
  try {
    response.json(await markNotificationRead(request.params.notificationId));
  } catch (error) {
    next(error);
  }
});
