import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Notification } from "../types";

interface NotificationsState {
  items: Notification[];
  isLoading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  isLoading: false
};

export const fetchNotifications = createAsyncThunk("notifications/fetch", async (userId: string) => {
  const response = await api.get(`/notifications/${userId}`);
  return response.data as Notification[];
});

export const markNotificationRead = createAsyncThunk("notifications/read", async (notificationId: string) => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data as Notification;
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        const notification = state.items.find((item) => item.id === action.meta.arg);
        if (notification) {
          notification.readAt = new Date().toISOString();
        }
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.items.find((item) => item.id === action.payload.id);
        if (notification) {
          notification.readAt = action.payload.readAt;
        }
      });
  }
});

export const notificationsReducer = notificationsSlice.reducer;
