import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to restore session
export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  if (storedUser && storedToken) {
    return {
      user: JSON.parse(storedUser),
      token: storedToken,
    };
  }
  return { user: null, token: null };
});

const userInfo = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const tokenInfo = localStorage.getItem("token") || null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: userInfo,
    token: tokenInfo,
    loading: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      if (action.payload) {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
      } else {
        state.user = null;
        state.token = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
      });
  },
});

export const { setCredentials, setLoading } = authSlice.actions;
export default authSlice.reducer;
