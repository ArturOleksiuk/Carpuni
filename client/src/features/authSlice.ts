import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { api } from "../api";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  whitelistFound: boolean;
  whitelistProfile: Partial<User> | null;
  isLoading: boolean;
  error: string | null;
}

const savedSession = readSavedSession();

const initialState: AuthState = {
  user: savedSession.user,
  token: savedSession.token,
  whitelistFound: false,
  whitelistProfile: null,
  isLoading: false,
  error: null
};

export const checkWhitelist = createAsyncThunk("auth/checkWhitelist", async (email: string) => {
  const response = await api.get("/auth/whitelist", { params: { email } });
  return response.data as { found: boolean; profile: Partial<User> | null };
});

function getApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? "Помилка авторизації";
}

export const login = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", payload);
    return response.data as { token: string; user: User };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const register = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", payload);
    return response.data as { token: string; user: User };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearWhitelist(state) {
      state.whitelistFound = false;
      state.whitelistProfile = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.whitelistFound = false;
      state.whitelistProfile = null;
      localStorage.removeItem("carpuni.auth");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkWhitelist.fulfilled, (state, action) => {
        state.whitelistFound = action.payload.found;
        state.whitelistProfile = action.payload.profile;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        saveSession(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Помилка входу";
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        saveSession(action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Помилка реєстрації";
      });
  }
});

export const { clearWhitelist, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

function readSavedSession(): Pick<AuthState, "user" | "token"> {
  try {
    const rawSession = localStorage.getItem("carpuni.auth");
    if (!rawSession) {
      return { user: null, token: null };
    }

    const session = JSON.parse(rawSession) as Pick<AuthState, "user" | "token">;
    return {
      user: session.user ?? null,
      token: session.token ?? null
    };
  } catch {
    localStorage.removeItem("carpuni.auth");
    return { user: null, token: null };
  }
}

function saveSession(session: { token: string; user: User }) {
  localStorage.setItem("carpuni.auth", JSON.stringify(session));
}
