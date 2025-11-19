import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import treatmentApi from "../../services/treatmentApi";

/* ============================
    HELPERS (Normalizers)
============================ */
const normalizeTreatment = (raw) => {
  if (!raw) return null;

  // Archive returns: { message, treatment: {...} }
  if (raw.treatment) return raw.treatment;

  // Update returns full treatment directly
  if (raw._id) return raw;

  // Create returns { data: {...} }
  if (raw.data?._id) return raw.data;

  return null;
};

/* ============================
    ASYNC THUNKS
============================ */

// Fetch all treatments
export const fetchTreatments = createAsyncThunk(
  "treatments/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await treatmentApi.getAll();
      return res.data || [];
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
      return normalizeTreatment(res.data);
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
      return normalizeTreatment(res.data);
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
      return normalizeTreatment(res.data);
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
      return normalizeTreatment(res.data);
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
        state.treatments = action.payload;
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch one
      .addCase(fetchTreatmentById.fulfilled, (state, action) => {
        if (action.payload) {
          state.selected = action.payload;
        }
      })

      // Create
      .addCase(createTreatment.fulfilled, (state, action) => {
        if (action.payload?._id) {
          state.treatments.unshift(action.payload);
        }
      })

      // Update
      .addCase(updateTreatment.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?._id) return;

        const idx = state.treatments.findIndex(t => t._id === updated._id);
        if (idx !== -1) {
          state.treatments[idx] = updated;
        }
      })

      // Archive
      .addCase(archiveTreatment.fulfilled, (state, action) => {
        const archived = action.payload;
        if (!archived?._id) return;

        const idx = state.treatments.findIndex(t => t._id === archived._id);
        if (idx !== -1) {
          state.treatments[idx] = archived;
        }
      });
  },
});

/* EXPORTS */
export const { clearSelectedTreatment } = treatmentSlice.actions;
export default treatmentSlice.reducer;
