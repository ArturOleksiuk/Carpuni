import { Router } from "express";
import { getCurrentPair, getSchedule } from "../services/scheduleService.js";

export const scheduleRoutes = Router();

scheduleRoutes.get("/:userId", async (request, response, next) => {
  try {
    response.json({
      schedule: await getSchedule(request.params.userId),
      currentPair: await getCurrentPair(request.params.userId)
    });
  } catch (error) {
    next(error);
  }
});
