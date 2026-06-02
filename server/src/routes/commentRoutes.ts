import { Router } from "express";
import { createComment, deleteComment, getPostComments } from "../services/commentService.js";

export const commentRoutes = Router();

commentRoutes.get("/post/:postId", async (request, response, next) => {
  try {
    response.json(await getPostComments(request.params.postId));
  } catch (error) {
    next(error);
  }
});

commentRoutes.post("/post/:postId", async (request, response, next) => {
  try {
    const { authorId, content } = request.body as { authorId: string; content: string };
    response.status(201).json(await createComment(request.params.postId, authorId, content));
  } catch (error) {
    next(error);
  }
});

commentRoutes.delete("/:commentId", async (request, response, next) => {
  try {
    const { userId } = request.body as { userId: string };
    response.json(await deleteComment(request.params.commentId, userId));
  } catch (error) {
    next(error);
  }
});
