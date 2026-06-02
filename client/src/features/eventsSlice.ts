import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Event } from "../types";

interface EventsState {
  items: Event[];
  activeFilter: "all" | "today" | "mine";
  isLoading: boolean;
}

const initialState: EventsState = {
  items: [],
  activeFilter: "all",
  isLoading: false
};

export const fetchEvents = createAsyncThunk(
  "events/fetch",
  async (payload: { filter: EventsState["activeFilter"]; userId?: string }) => {
    const response = await api.get("/events", { params: payload });
    return response.data as Event[];
  }
);

export const registerForEvent = createAsyncThunk(
  "events/register",
  async (payload: { eventId: string; userId: string }) => {
    const response = await api.post(`/events/${payload.eventId}/register`, { userId: payload.userId });
    return response.data as Event;
  }
);

export const cancelEvent = createAsyncThunk(
  "events/cancel",
  async (payload: { eventId: string; userId: string }) => {
    const response = await api.post(`/events/${payload.eventId}/cancel`, { userId: payload.userId });
    return response.data as Event;
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEventFilter(state, action: { payload: EventsState["activeFilter"] }) {
      state.activeFilter = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(registerForEvent.pending, (state, action) => {
        applyRegistrationState(state, action.meta.arg.eventId, action.meta.arg.userId, true);
      })
      .addCase(registerForEvent.fulfilled, updateEvent)
      .addCase(registerForEvent.rejected, (state, action) => {
        applyRegistrationState(state, action.meta.arg.eventId, action.meta.arg.userId, false);
      })
      .addCase(cancelEvent.pending, (state, action) => {
        applyRegistrationState(state, action.meta.arg.eventId, action.meta.arg.userId, false);
      })
      .addCase(cancelEvent.fulfilled, updateEvent)
      .addCase(cancelEvent.rejected, (state, action) => {
        applyRegistrationState(state, action.meta.arg.eventId, action.meta.arg.userId, true);
      });
  }
});

function updateEvent(state: EventsState, action: { payload: Event }) {
  const existing = state.items.find((event) => event.id === action.payload.id);
  if (existing) {
    existing.registeredCount = action.payload.registeredCount;
    existing.registeredUserIds = action.payload.registeredUserIds;
  }
}

function applyRegistrationState(state: EventsState, eventId: string, userId: string, shouldRegister: boolean) {
  const event = state.items.find((item) => item.id === eventId);
  if (!event) {
    return;
  }

  const isRegistered = event.registeredUserIds.includes(userId);
  if (shouldRegister && !isRegistered) {
    event.registeredUserIds.push(userId);
    event.registeredCount += 1;
  }
  if (!shouldRegister && isRegistered) {
    event.registeredUserIds = event.registeredUserIds.filter((id) => id !== userId);
    event.registeredCount = Math.max(0, event.registeredCount - 1);
  }
}

export const { setEventFilter } = eventsSlice.actions;
export const eventsReducer = eventsSlice.reducer;
