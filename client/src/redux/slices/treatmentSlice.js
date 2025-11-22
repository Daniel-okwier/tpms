import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import treatmentApi from "../../services/treatmentApi";

/* ============================
    HELPERS (Normalizers)
============================ */
const normalizeTreatment = (raw) => {
  if (!raw) return null;

  // Archive returns: { message, treatment: {...} }
  if (raw.treatment) return raw.treatment;

  // Visit update returns { treatment: {...} }
  if (raw.updatedTreatment) return raw.updatedTreatment;

  // General update returns full treatment
  if (raw._id) return raw;

  // Create returns { data: {...} }
  if (raw.data?._id) return raw.data;

  return null;
};

/* ============================
    ASYNC THUNKS — Visits
============================ */

// ADD NEW VISIT
export const addVisit = createAsyncThunk(
  "treatments/addVisit",
  async ({ treatmentId, visitDate, status }, thunkAPI) => {
    try {
      const res = await treatmentApi.addVisit(treatmentId, {
        visitDate,
        status,
      });

      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// UPDATE VISIT (edit)
export const updateVisit = createAsyncThunk(
  "treatments/updateVisit",
  async ({ treatmentId, visitId, updates }, thunkAPI) => {
    try {
      const res = await treatmentApi.updateVisit(
        treatmentId,
        visitId,
        updates
      );

      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// MARK COMPLETED
export const markVisitCompleted = createAsyncThunk(
  "treatments/markVisitCompleted",
  async ({ treatmentId, visitId }, thunkAPI) => {
    try {
      const res = await treatmentApi.updateVisit(treatmentId, visitId, {
        status: "completed",
      });

      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// MARK MISSED
export const markVisitMissed = createAsyncThunk(
  "treatments/markVisitMissed",
  async ({ treatmentId, visitId }, thunkAPI) => {
    try {
      const res = await treatmentApi.updateVisit(treatmentId, visitId, {
        status: "missed",
      });

      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ============================
    BASIC CRUD THUNKS
============================ */

export const fetchTreatments = createAsyncThunk(
  "treatments/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await treatmentApi.getAll();
      return res.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const fetchTreatmentById = createAsyncThunk(
  "treatments/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await treatmentApi.getById(id);
      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createTreatment = createAsyncThunk(
  "treatments/create",
  async (payload, thunkAPI) => {
    try {
      const res = await treatmentApi.create(payload);
      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const updateTreatment = createAsyncThunk(
  "treatments/update",
  async ({ id, updates }, thunkAPI) => {
    try {
      const res = await treatmentApi.update(id, updates);
      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const archiveTreatment = createAsyncThunk(
  "treatments/archive",
  async (id, thunkAPI) => {
    try {
      const res = await treatmentApi.archive(id);
      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
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
      /* --- FETCH ALL --- */
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

      /* --- FETCH ONE --- */
      .addCase(fetchTreatmentById.fulfilled, (state, action) => {
        if (action.payload) state.selected = action.payload;
      })

      /* --- CREATE --- */
      .addCase(createTreatment.fulfilled, (state, action) => {
        if (action.payload?._id) {
          state.treatments.unshift(action.payload);
        }
      })

      /* --- UPDATE --- */
      .addCase(updateTreatment.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?._id) return;

        const idx = state.treatments.findIndex((t) => t._id === updated._id);
        if (idx !== -1) {
          state.treatments[idx] = updated;
        }

        if (state.selected?._id === updated._id) {
          state.selected = updated;
        }
      })

      /* --- ARCHIVE --- */
      .addCase(archiveTreatment.fulfilled, (state, action) => {
        const archived = action.payload;
        if (!archived?._id) return;

        const idx = state.treatments.findIndex((t) => t._id === archived._id);
        if (idx !== -1) {
          state.treatments[idx] = archived;
        }

        if (state.selected?._id === archived._id) {
          state.selected = archived;
        }
      })

      /* --- VISIT ACTIONS (shared handler) --- */
      .addCase(addVisit.fulfilled, updateTreatmentState)
      .addCase(updateVisit.fulfilled, updateTreatmentState)
      .addCase(markVisitCompleted.fulfilled, updateTreatmentState)
      .addCase(markVisitMissed.fulfilled, updateTreatmentState);
  },
});

/* --------------------------
    SHARED VISIT REDUCER
--------------------------- */

function updateTreatmentState(state, action) {
  const updated = action.payload;
  if (!updated?._id) return;

  const idx = state.treatments.findIndex((t) => t._id === updated._id);
  if (idx !== -1) {
    state.treatments[idx] = updated;
  }

  if (state.selected?._id === updated._id) {
    state.selected = updated;
  }
}

/* EXPORTS */
export const { clearSelectedTreatment } = treatmentSlice.actions;

export {
  addVisit,
  updateVisit,
  markVisitCompleted,
  markVisitMissed,
};

export default treatmentSlice.reducer;
