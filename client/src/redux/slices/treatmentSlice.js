import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import treatmentApi from "../../services/treatmentApi";

/* ============================
    ASYNC THUNKS
============================ */

// Fetch all treatments
export const fetchTreatments = createAsyncThunk(
  "treatments/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await treatmentApi.getAll();
      return res.data || []; // Ensure it returns the correct structure
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch one treatment
export const fetchTreatmentById = createAsyncThunk(
  "treatments/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await treatmentApi.getById(id);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create treatment
export const createTreatment = createAsyncThunk(
  "treatments/create",
  async (payload, thunkAPI) => {
    try {
      const res = await treatmentApi.create(payload);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update treatment
export const updateTreatment = createAsyncThunk(
  "treatments/update",
  async ({ id, updates }, thunkAPI) => {
    try {
      const res = await treatmentApi.update(id, updates);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Archive treatment
export const archiveTreatment = createAsyncThunk(
  "treatments/archive",
  async (id, thunkAPI) => {
    try {
      const res = await treatmentApi.archive(id);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* ============================
        SLICE
============================ */

const treatmentSlice = createSlice({
  name: "treatments",
  initialState: {
    treatments: [],
    selected: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearSelectedTreatment: (state) => {
      state.selected = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchTreatments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments = action.payload; // Make sure payload is the list
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch one
      .addCase(fetchTreatmentById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      // Create
      .addCase(createTreatment.fulfilled, (state, action) => {
        state.treatments.unshift(action.payload);
      })

      // Update
      .addCase(updateTreatment.fulfilled, (state, action) => {
        const idx = state.treatments.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.treatments[idx] = action.payload;
      })

      // Archive
      .addCase(archiveTreatment.fulfilled, (state, action) => {
        const idx = state.treatments.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) {
          // Optionally remove from list or update status
          state.treatments[idx].archived = true; 
        }
      });
  },
});

/* ============================
    EXPORTS
============================ */
export const { clearSelectedTreatment } = treatmentSlice.actions;
export default treatmentSlice.reducer;