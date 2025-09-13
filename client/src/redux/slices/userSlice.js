import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";


// Async thunks

export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { getState }) => {
  const { auth } = getState();
  const res = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  return res.data;
});

export const addUser = createAsyncThunk("users/add", async (userData, { getState }) => {
  const { auth } = getState();
  const res = await axios.post(`${API_URL}/create-user`, userData, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  return res.data.user;
});

export const removeUser = createAsyncThunk("users/remove", async (id, { getState }) => {
  const { auth } = getState();
  await axios.delete(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  return id;
});


const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // add user
      .addCase(addUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // remove user
      .addCase(removeUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
