import { configureStore } from "@reduxjs/toolkit";
import { adminReducer } from "./features/adminSlice";
import { authReducer } from "./features/authSlice";
import { commentsReducer } from "./features/commentsSlice";
import { eventsReducer } from "./features/eventsSlice";
import { postsReducer } from "./features/postsSlice";
import { notificationsReducer } from "./features/notificationsSlice";
import { profileReducer } from "./features/profileSlice";
import { scheduleReducer } from "./features/scheduleSlice";
import { socialReducer } from "./features/socialSlice";
import { uiReducer } from "./features/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    profile: profileReducer,
    comments: commentsReducer,
    social: socialReducer,
    notifications: notificationsReducer,
    events: eventsReducer,
    schedule: scheduleReducer,
    admin: adminReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
