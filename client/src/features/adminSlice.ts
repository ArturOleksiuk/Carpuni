import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { AdminOverview } from "../types";

type Complaint = AdminOverview["complaints"][number];

interface AdminState {
  overview: AdminOverview | null;
  removedComplaints: Record<string, Complaint>;
}

const initialState: AdminState = {
  overview: null,
  removedComplaints: {}
};

export const fetchAdminOverview = createAsyncThunk("admin/overview", async () => {
  const response = await api.get("/admin/overview");
  return response.data as AdminOverview;
});

export const resolveComplaint = createAsyncThunk(
  "admin/resolveComplaint",
  async (payload: { complaintId: string; action: "delete" | "block" | "ignore" }) => {
    await api.post(`/admin/complaints/${payload.complaintId}/${payload.action}`);
    return payload.complaintId;
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
        state.removedComplaints = {};
      })
      .addCase(resolveComplaint.pending, (state, action) => {
        if (!state.overview) {
          return;
        }

        const complaint = state.overview.complaints.find((item) => item.id === action.meta.arg.complaintId);
        if (complaint) {
          state.removedComplaints[action.meta.arg.complaintId] = complaint;
        }

        state.overview.complaints = state.overview.complaints.filter(
          (item) => item.id !== action.meta.arg.complaintId
        );
      })
      .addCase(resolveComplaint.fulfilled, (state, action) => {
        delete state.removedComplaints[action.payload];
      })
      .addCase(resolveComplaint.rejected, (state, action) => {
        const complaint = state.removedComplaints[action.meta.arg.complaintId];
        if (state.overview && complaint) {
          state.overview.complaints.unshift(complaint);
          delete state.removedComplaints[action.meta.arg.complaintId];
        }
      });
  }
});

export const adminReducer = adminSlice.reducer;
