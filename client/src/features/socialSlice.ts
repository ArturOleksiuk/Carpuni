import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Post, SuggestedUser } from "../types";

type ToggleFollowPayload = {
  followerId: string;
  followingId: string;
  follower?: SuggestedUser;
};

interface SocialState {
  savedPosts: Post[];
  suggestions: SuggestedUser[];
  followers: SuggestedUser[];
  following: SuggestedUser[];
  followersOwnerId: string | null;
  followingOwnerId: string | null;
  removedFollowing: Record<string, SuggestedUser>;
  removedFollowers: Record<string, SuggestedUser>;
  removedSavedPosts: Record<string, Post>;
}

const initialState: SocialState = {
  savedPosts: [],
  suggestions: [],
  followers: [],
  following: [],
  followersOwnerId: null,
  followingOwnerId: null,
  removedFollowing: {},
  removedFollowers: {},
  removedSavedPosts: {}
};

export const fetchSavedPosts = createAsyncThunk("social/fetchSavedPosts", async (userId: string) => {
  const response = await api.get(`/social/saved/${userId}`);
  return response.data as Post[];
});

export const toggleSavedPost = createAsyncThunk(
  "social/toggleSavedPost",
  async (payload: { userId: string; postId: string }) => {
    const response = await api.post("/social/saved", payload);
    return { ...payload, ...(response.data as { saved: boolean }) };
  }
);

export const fetchFollowSuggestions = createAsyncThunk("social/fetchFollowSuggestions", async (userId: string) => {
  const response = await api.get(`/social/suggestions/${userId}`);
  return response.data as SuggestedUser[];
});

export const toggleFollow = createAsyncThunk(
  "social/toggleFollow",
  async (payload: ToggleFollowPayload) => {
    const response = await api.post("/social/follow", payload);
    return { ...payload, ...(response.data as { following: boolean }) };
  }
);

export const fetchFollowers = createAsyncThunk(
  "social/fetchFollowers",
  async (payload: { userId: string; viewerId: string }) => {
    const response = await api.get(`/social/followers/${payload.userId}`, { params: { viewerId: payload.viewerId } });
    return { userId: payload.userId, users: response.data as SuggestedUser[] };
  }
);

export const fetchFollowing = createAsyncThunk(
  "social/fetchFollowing",
  async (payload: { userId: string; viewerId: string }) => {
    const response = await api.get(`/social/following/${payload.userId}`, { params: { viewerId: payload.viewerId } });
    return { userId: payload.userId, users: response.data as SuggestedUser[] };
  }
);

const socialSlice = createSlice({
  name: "social",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.savedPosts = action.payload;
        state.removedSavedPosts = {};
      })
      .addCase(toggleSavedPost.pending, (state, action) => {
        const post = state.savedPosts.find((item) => item.id === action.meta.arg.postId);
        if (post) {
          state.removedSavedPosts[action.meta.arg.postId] = post;
          state.savedPosts = state.savedPosts.filter((item) => item.id !== action.meta.arg.postId);
        }
      })
      .addCase(toggleSavedPost.fulfilled, (state, action) => {
        delete state.removedSavedPosts[action.payload.postId];
      })
      .addCase(toggleSavedPost.rejected, (state, action) => {
        const post = state.removedSavedPosts[action.meta.arg.postId];
        if (post) {
          state.savedPosts.unshift(post);
          delete state.removedSavedPosts[action.meta.arg.postId];
        }
      })
      .addCase(fetchFollowSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload.users;
        state.followersOwnerId = action.payload.userId;
        state.removedFollowers = {};
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload.users;
        state.followingOwnerId = action.payload.userId;
        state.removedFollowing = {};
      })
      .addCase(toggleFollow.pending, (state, action) => {
        const shouldRemoveFromFollowingList = state.followingOwnerId === action.meta.arg.followerId;
        const followingUser = shouldRemoveFromFollowingList
          ? state.following.find((item) => item.id === action.meta.arg.followingId)
          : null;
        if (followingUser?.viewerIsFollowing) {
          state.removedFollowing[action.meta.arg.followingId] = followingUser;
          state.following = state.following.filter((item) => item.id !== action.meta.arg.followingId);
        }
        applyViewedProfileFollowersState(state, action.meta.arg);
        applyFollowState(state, action.meta.arg.followingId);
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        delete state.removedFollowing[action.payload.followingId];
        delete state.removedFollowers[action.payload.followingId];
        applyViewedProfileFollowersState(state, action.payload, action.payload.following);
        applyFollowState(state, action.payload.followingId, action.payload.following);
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        const removedUser = state.removedFollowing[action.meta.arg.followingId];
        if (removedUser) {
          state.following.unshift(removedUser);
          delete state.removedFollowing[action.meta.arg.followingId];
        }
        applyViewedProfileFollowersState(state, action.meta.arg);
        applyFollowState(state, action.meta.arg.followingId);
      });
  }
});

function applyFollowState(state: SocialState, userId: string, forcedState?: boolean) {
  [state.suggestions, state.followers, state.following].forEach((collection) => {
    const user = collection.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    const nextState = forcedState ?? !user.viewerIsFollowing;
    if (nextState !== user.viewerIsFollowing) {
      user.followersCount += nextState ? 1 : -1;
    }
    user.viewerIsFollowing = nextState;
  });
}

function applyViewedProfileFollowersState(state: SocialState, payload: ToggleFollowPayload, forcedState?: boolean) {
  if (state.followersOwnerId !== payload.followingId || !payload.follower) {
    return;
  }

  const userId = payload.followingId;
  const profileUser =
    state.suggestions.find((item) => item.id === userId) ??
    state.followers.find((item) => item.id === userId) ??
    state.following.find((item) => item.id === userId);
  const targetUserIsCurrentlyShownAsFollowed = profileUser?.viewerIsFollowing ?? false;
  const nextState = forcedState ?? !targetUserIsCurrentlyShownAsFollowed;

  if (nextState) {
    const alreadyInFollowers = state.followers.some((item) => item.id === payload.follower?.id);
    if (!alreadyInFollowers) {
      state.followers.unshift(payload.follower);
    }
    return;
  }

  const follower = state.followers.find((item) => item.id === payload.follower?.id);
  if (follower) {
    state.removedFollowers[userId] = follower;
    state.followers = state.followers.filter((item) => item.id !== payload.follower?.id);
  } else if (state.removedFollowers[userId]) {
    state.followers.unshift(state.removedFollowers[userId]);
    delete state.removedFollowers[userId];
  }
}

export const socialReducer = socialSlice.reducer;
