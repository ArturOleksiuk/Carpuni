import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  homeTab: "feed" | "events";
}

const initialState: UIState = {
  homeTab: "feed"
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setHomeTab(state, action: { payload: UIState["homeTab"] }) {
      state.homeTab = action.payload;
    }
  }
});

export const { setHomeTab } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
