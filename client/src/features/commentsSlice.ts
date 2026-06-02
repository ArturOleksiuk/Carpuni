import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { PostComment, User } from "../types";

interface CommentsBucket {
  items: PostComment[];
  isLoading: boolean;
}

interface CommentsState {
  byPostId: Record<string, CommentsBucket>;
}

const initialState: CommentsState = {
  byPostId: {}
};

export const fetchComments = createAsyncThunk("comments/fetch", async (postId: string) => {
  const response = await api.get(`/comments/post/${postId}`);
  return { postId, comments: response.data as PostComment[] };
});

export const addComment = createAsyncThunk(
  "comments/add",
  async (payload: { postId: string; authorId: string; content: string; author?: User }) => {
    const response = await api.post(`/comments/post/${payload.postId}`, {
      authorId: payload.authorId,
      content: payload.content
    });
    return response.data as PostComment;
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        const bucket = getBucket(state, action.meta.arg);
        bucket.isLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.byPostId[action.payload.postId] = {
          items: action.payload.comments,
          isLoading: false
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const bucket = getBucket(state, action.meta.arg);
        bucket.isLoading = false;
      })
      .addCase(addComment.pending, (state, action) => {
        const bucket = getBucket(state, action.meta.arg.postId);
        bucket.items.push({
          id: `temp-${action.meta.requestId}`,
          postId: action.meta.arg.postId,
          authorId: action.meta.arg.authorId,
          author: action.meta.arg.author,
          content: action.meta.arg.content,
          likesCount: 0,
          isDeleted: false,
          createdAt: new Date().toISOString()
        });
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const tempId = `temp-${action.meta.requestId}`;
        const bucket = getBucket(state, action.meta.arg.postId);
        const index = bucket.items.findIndex((comment) => comment.id === tempId);
        const comment = {
          ...action.payload,
          author: action.payload.author ?? action.meta.arg.author
        };

        if (index >= 0) {
          bucket.items[index] = comment;
        } else {
          bucket.items.push(comment);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        const tempId = `temp-${action.meta.requestId}`;
        const bucket = getBucket(state, action.meta.arg.postId);
        bucket.items = bucket.items.filter((comment) => comment.id !== tempId);
      });
  }
});

function getBucket(state: CommentsState, postId: string) {
  state.byPostId[postId] ??= { items: [], isLoading: false };
  return state.byPostId[postId];
}

export const commentsReducer = commentsSlice.reducer;
