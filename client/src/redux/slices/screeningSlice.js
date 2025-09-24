// src/redux/screeningsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_URL = "http://localhost:5000/api/screenings";

// Fetch all screenings
export const fetchScreenings = createAsyncThunk(
  "screenings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch screenings");
    }
  }
);

// Delete (void) a screening
export const deleteScreening = createAsyncThunk(
  "screenings/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/${id}/void`,
        { reason: "Voided from dashboard" },
        { withCredentials: true }
      );
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to void screening");
    }
  }
);

const screeningsSlice = createSlice({
  name: "screenings",
  initialState: {
    screenings: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchScreenings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScreenings.fulfilled, (state, action) => {
        state.loading = false;
        state.screenings = action.payload;
      })
      .addCase(fetchScreenings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete / Void
    builder
      .addCase(deleteScreening.fulfilled, (state, action) => {
        state.screenings = state.screenings.filter(
          (s) => s._id !== action.payload.id
        );
      })
      .addCase(deleteScreening.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default screeningsSlice.reducer;
