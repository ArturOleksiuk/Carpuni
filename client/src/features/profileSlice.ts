import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { toggleFollow } from "./socialSlice";
import type { ProfileUser } from "../types";

interface ProfileState {
  user: ProfileUser | null;
  isLoading: boolean;
}

const initialState: ProfileState = {
  user: null,
  isLoading: false
};

export const fetchProfileUser = createAsyncThunk(
  "profile/fetchUser",
  async (payload: { userId: string; viewerId: string }) => {
    const response = await api.get(`/users/${payload.userId}`, { params: { viewerId: payload.viewerId } });
    return response.data as ProfileUser;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileUser(state) {
      state.user = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfileUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProfileUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(toggleFollow.pending, (state, action) => {
        if (state.user?.id === action.meta.arg.followingId) {
          state.user.viewerIsFollowing = !state.user.viewerIsFollowing;
          state.user.followersCount += state.user.viewerIsFollowing ? 1 : -1;
        }
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        if (state.user?.id === action.payload.followingId) {
          state.user.viewerIsFollowing = action.payload.following;
        }
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        if (state.user?.id === action.meta.arg.followingId) {
          state.user.viewerIsFollowing = !state.user.viewerIsFollowing;
          state.user.followersCount += state.user.viewerIsFollowing ? 1 : -1;
        }
      });
  }
});

export const { clearProfileUser } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
