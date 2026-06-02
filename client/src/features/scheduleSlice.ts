import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Pair, Schedule } from "../types";

interface ScheduleState {
  schedule: Schedule | null;
  currentPair: Pair | null;
}

const initialState: ScheduleState = {
  schedule: null,
  currentPair: null
};

export const fetchSchedule = createAsyncThunk("schedule/fetch", async (userId: string) => {
  const response = await api.get(`/schedule/${userId}`);
  return response.data as ScheduleState;
});

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSchedule.fulfilled, (state, action) => {
      state.schedule = action.payload.schedule;
      state.currentPair = action.payload.currentPair;
    });
  }
});

export const scheduleReducer = scheduleSlice.reducer;
