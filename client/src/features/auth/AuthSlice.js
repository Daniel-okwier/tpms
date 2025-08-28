import { createSlice } from "@reduxjs/toolkit";

// Safely parse stored user
function getStoredUser() {
  try {
    const stored = sessionStorage.getItem("user");
    if (!stored || stored === "undefined") return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

const initialState = {
  user: null, // not immediately loaded
  token: null,
  loading: true, // <-- important: show loader until restore runs
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.loading = false;

      // Save to sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },
    restoreSession: (state) => {
      const user = getStoredUser();
      const token = sessionStorage.getItem("token");

      if (user && token) {
        state.user = user;
        state.token = token;
      } else {
        state.user = null;
        state.token = null;
      }

      state.loading = false;
    },
  },
});

export const { setCredentials, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
