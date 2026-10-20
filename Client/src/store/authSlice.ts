import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface User {
  id?: string;
  username?: string;
  fullName?: string;
  role?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

interface SessionError {
  message: string;
  unauthorized: boolean;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: User;
}

interface MeResponse {
  success?: boolean;
  user?: User;
  message?: string;
}

const apiUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/`
  : "";

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${apiUrl}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });
    const responseText = await response.text();
    let result: LoginResponse = {};

    if (responseText) {
      try {
        result = JSON.parse(responseText) as LoginResponse;
      } catch {
        return rejectWithValue("The server returned an invalid response. Please try again.");
      }
    }

    if (!response.ok || !result.success) {
      return rejectWithValue(
        result.message || "Login failed. Please check your username and password.",
      );
    }

    return result.data || {};
  } catch (error) {
    return rejectWithValue(
      error instanceof Error && error.message === "Failed to fetch"
        ? "Unable to connect to the server. Please try again."
        : "Unable to log in right now. Please try again.",
    );
  }
});

export const verifySession = createAsyncThunk<
  User,
  void,
  { rejectValue: SessionError }
>("auth/verifySession", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${apiUrl}auth/me`, {
      method: "GET",
      credentials: "include",
    });
    const responseText = await response.text();
    let result: MeResponse = {};

    if (responseText) {
      try {
        result = JSON.parse(responseText) as MeResponse;
      } catch {
        return rejectWithValue({
          message: "The server returned an invalid response.",
          unauthorized: false,
        });
      }
    }

    if (response.status === 401) {
      return rejectWithValue({
        message: "Your session has expired. Please log in again.",
        unauthorized: true,
      });
    }

    if (!response.ok || !result.success || !result.user) {
      return rejectWithValue({
        message: result.message || "Unable to verify your session.",
        unauthorized: false,
      });
    }

    return result.user;
  } catch {
    return rejectWithValue({
      message: "Unable to verify your session.",
      unauthorized: false,
    });
  }
});

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${apiUrl}auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    const responseText = await response.text();
    let result: { success?: boolean; message?: string } = {};

    if (responseText) {
      try {
        result = JSON.parse(responseText) as { success?: boolean; message?: string };
      } catch {
        return rejectWithValue("The server returned an invalid response.");
      }
    }

    if (!response.ok || !result.success) {
      return rejectWithValue(result.message || "Unable to log out. Please try again.");
    }
  } catch {
    return rejectWithValue("Unable to log out. Please try again.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to log in right now. Please try again.";
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(verifySession.rejected, (state, action) => {
        if (action.payload?.unauthorized) {
          state.user = null;
        }
      })
      .addCase(logout.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to log out. Please try again.";
      });
  },
});

export const { clearAuthError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
