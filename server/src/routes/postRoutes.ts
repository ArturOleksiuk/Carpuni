import { Router } from "express";
import { createPost, deletePost, getFeed, toggleLike } from "../services/postService.js";

export const postRoutes = Router();

postRoutes.get("/", async (_request, response, next) => {
  try {
    response.json(await getFeed(String(_request.query.userId ?? "")));
  } catch (error) {
    next(error);
  }
});

postRoutes.post("/", async (request, response, next) => {
  try {
    const { authorId, content, mediaUrls } = request.body as {
      authorId: string;
      content: string;
      mediaUrls?: string[];
    };
    response.status(201).json(await createPost(authorId, content, mediaUrls));
  } catch (error) {
    next(error);
  }
});

postRoutes.post("/:postId/like", async (request, response, next) => {
  try {
    const { userId } = request.body as { userId: string };
    response.json(await toggleLike(request.params.postId, userId));
  } catch (error) {
    next(error);
  }
});

postRoutes.delete("/:postId", async (request, response, next) => {
  try {
    const { userId } = request.body as { userId: string };
    response.json(await deletePost(request.params.postId, userId));
  } catch (error) {
    next(error);
  }
});
