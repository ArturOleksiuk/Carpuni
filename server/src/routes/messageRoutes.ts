import { Router } from "express";
import { getConversations, getMessages, sendMessage } from "../services/messageService.js";

export const messageRoutes = Router();

messageRoutes.get("/conversations/:userId", async (request, response, next) => {
  try {
    response.json(await getConversations(request.params.userId));
  } catch (error) {
    next(error);
  }
});

messageRoutes.get("/:conversationId", async (request, response, next) => {
  try {
    response.json(await getMessages(request.params.conversationId));
  } catch (error) {
    next(error);
  }
});

messageRoutes.post("/:conversationId", async (request, response, next) => {
  try {
    const { senderId, text } = request.body as { senderId: string; text: string };
    response.status(201).json(await sendMessage(request.params.conversationId, senderId, text));
  } catch (error) {
    next(error);
  }
});
