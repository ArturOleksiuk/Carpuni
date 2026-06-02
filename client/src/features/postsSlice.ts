import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { addComment } from "./commentsSlice";
import { toggleSavedPost } from "./socialSlice";
import type { Post, User } from "../types";

interface PostsState {
  items: Post[];
  isLoading: boolean;
  removedPosts: Record<string, Post>;
}

const initialState: PostsState = {
  items: [],
  isLoading: false,
  removedPosts: {}
};

export const fetchPosts = createAsyncThunk("posts/fetch", async (userId?: string) => {
  const response = await api.get("/posts", { params: { userId } });
  return response.data as Post[];
});

export const createPost = createAsyncThunk(
  "posts/create",
  async (payload: { authorId: string; content: string; author?: User }) => {
    const response = await api.post("/posts", payload);
    return response.data as Post;
  }
);

export const likePost = createAsyncThunk("posts/like", async (payload: { postId: string; userId: string }) => {
  const response = await api.post(`/posts/${payload.postId}/like`, { userId: payload.userId });
  return response.data as Post;
});

export const deletePost = createAsyncThunk("posts/delete", async (payload: { postId: string; userId: string }) => {
  await api.delete(`/posts/${payload.postId}`, { data: { userId: payload.userId } });
  return payload.postId;
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(createPost.pending, (state, action) => {
        const hashtags = Array.from(action.meta.arg.content.matchAll(/#[\p{L}\p{N}_-]+/gu)).map((match) =>
          match[0].slice(1)
        );
        state.items.unshift({
          id: `temp-${action.meta.requestId}`,
          authorId: action.meta.arg.authorId,
          author: action.meta.arg.author,
          content: action.meta.arg.content,
          hashtags,
          likesCount: 0,
          commentsCount: 0,
          repostsCount: 0,
          viewerHasLiked: false,
          createdAt: new Date().toISOString()
        });
      })
      .addCase(createPost.fulfilled, (state, action) => {
        const tempIndex = state.items.findIndex((post) => post.id === `temp-${action.meta.requestId}`);
        const post = {
          ...action.payload,
          author: action.payload.author ?? action.meta.arg.author
        };
        if (tempIndex >= 0) {
          state.items[tempIndex] = post;
        } else {
          state.items.unshift(post);
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.items = state.items.filter((post) => post.id !== `temp-${action.meta.requestId}`);
      })
      .addCase(likePost.pending, (state, action) => {
        const existing = state.items.find((post) => post.id === action.meta.arg.postId);
        if (existing) {
          const nextLiked = !existing.viewerHasLiked;
          existing.viewerHasLiked = nextLiked;
          existing.likesCount += nextLiked ? 1 : -1;
        }
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const existing = state.items.find((post) => post.id === action.payload.id);
        if (existing) {
          existing.likesCount = action.payload.likesCount;
          existing.viewerHasLiked = action.payload.viewerHasLiked;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        const existing = state.items.find((post) => post.id === action.meta.arg.postId);
        if (existing) {
          const rolledBackLiked = !existing.viewerHasLiked;
          existing.viewerHasLiked = rolledBackLiked;
          existing.likesCount += rolledBackLiked ? 1 : -1;
        }
      })
      .addCase(addComment.pending, (state, action) => {
        const post = state.items.find((item) => item.id === action.meta.arg.postId);
        if (post) {
          post.commentsCount = (post.commentsCount ?? 0) + 1;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        const post = state.items.find((item) => item.id === action.meta.arg.postId);
        if (post) {
          post.commentsCount = Math.max(0, (post.commentsCount ?? 0) - 1);
        }
      })
      .addCase(deletePost.pending, (state, action) => {
        const post = state.items.find((item) => item.id === action.meta.arg.postId);
        if (post) {
          state.removedPosts[action.meta.arg.postId] = post;
          state.items = state.items.filter((item) => item.id !== action.meta.arg.postId);
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        delete state.removedPosts[action.payload];
      })
      .addCase(deletePost.rejected, (state, action) => {
        const post = state.removedPosts[action.meta.arg.postId];
        if (post) {
          state.items.unshift(post);
          delete state.removedPosts[action.meta.arg.postId];
        }
      })
      .addCase(toggleSavedPost.pending, (state, action) => {
        const post = state.items.find((item) => item.id === action.meta.arg.postId);
        if (post) {
          post.viewerHasSaved = !post.viewerHasSaved;
        }
      })
      .addCase(toggleSavedPost.fulfilled, (state, action) => {
        const post = state.items.find((item) => item.id === action.payload.postId);
        if (post) {
          post.viewerHasSaved = action.payload.saved;
        }
      })
      .addCase(toggleSavedPost.rejected, (state, action) => {
        const post = state.items.find((item) => item.id === action.meta.arg.postId);
        if (post) {
          post.viewerHasSaved = !post.viewerHasSaved;
        }
      });
  }
});

export const postsReducer = postsSlice.reducer;
