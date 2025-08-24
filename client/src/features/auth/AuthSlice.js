import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {
    name: 'Dr. John Doe',
    role: 'admin', // change to doctor/lab to test different sidebars
  },
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
