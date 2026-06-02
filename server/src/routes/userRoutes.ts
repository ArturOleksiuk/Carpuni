import { Router } from "express";
import { getUserProfile } from "../services/userService.js";

export const userRoutes = Router();

userRoutes.get("/:userId", async (request, response, next) => {
  try {
    response.json(await getUserProfile(request.params.userId, String(request.query.viewerId ?? "")));
  } catch (error) {
    next(error);
  }
});
