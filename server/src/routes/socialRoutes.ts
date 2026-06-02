import { Router } from "express";
import {
  getFollowers,
  getFollowing,
  getFollowSuggestions,
  getSavedPosts,
  toggleFollow,
  toggleSavedPost
} from "../services/socialService.js";

export const socialRoutes = Router();

socialRoutes.post("/follow", async (request, response, next) => {
  try {
    const { followerId, followingId } = request.body as { followerId: string; followingId: string };
    response.json(await toggleFollow(followerId, followingId));
  } catch (error) {
    next(error);
  }
});

socialRoutes.get("/suggestions/:userId", async (request, response, next) => {
  try {
    response.json(await getFollowSuggestions(request.params.userId));
  } catch (error) {
    next(error);
  }
});

socialRoutes.get("/followers/:userId", async (request, response, next) => {
  try {
    response.json(await getFollowers(request.params.userId, String(request.query.viewerId ?? "")));
  } catch (error) {
    next(error);
  }
});

socialRoutes.get("/following/:userId", async (request, response, next) => {
  try {
    response.json(await getFollowing(request.params.userId, String(request.query.viewerId ?? "")));
  } catch (error) {
    next(error);
  }
});

socialRoutes.get("/saved/:userId", async (request, response, next) => {
  try {
    response.json(await getSavedPosts(request.params.userId));
  } catch (error) {
    next(error);
  }
});

socialRoutes.post("/saved", async (request, response, next) => {
  try {
    const { userId, postId } = request.body as { userId: string; postId: string };
    response.json(await toggleSavedPost(userId, postId));
  } catch (error) {
    next(error);
  }
});
