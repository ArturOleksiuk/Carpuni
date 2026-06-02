import { Router } from "express";
import { cancelEventRegistration, getEvents, registerEvent } from "../services/eventService.js";

export const eventRoutes = Router();

eventRoutes.get("/", async (request, response, next) => {
  try {
    response.json(await getEvents(String(request.query.filter ?? "all"), String(request.query.userId ?? "")));
  } catch (error) {
    next(error);
  }
});

eventRoutes.post("/:eventId/register", async (request, response, next) => {
  try {
    const { userId } = request.body as { userId: string };
    response.json(await registerEvent(request.params.eventId, userId));
  } catch (error) {
    next(error);
  }
});

eventRoutes.post("/:eventId/cancel", async (request, response, next) => {
  try {
    const { userId } = request.body as { userId: string };
    response.json(await cancelEventRegistration(request.params.eventId, userId));
  } catch (error) {
    next(error);
  }
});
