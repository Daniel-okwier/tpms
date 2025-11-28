import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import treatmentApi from "../../services/treatmentApi";

// HELPERS (Normalizers)
const normalizeTreatment = (raw) => {
  if (!raw) return null;
  if (raw.treatment) return raw.treatment;
  if (raw.updatedTreatment) return raw.updatedTreatment;
  if (raw._id) return raw;
  if (raw.data?._id) return raw.data;
  return null;
};

// ASYNC THUNKS — VISITS

// MARK COMPLETED
export const markVisitCompleted = createAsyncThunk(
  "treatments/markVisitCompleted",
  async ({ treatmentId, visitId }, thunkAPI) => {
    try {
      const followUpData = {
        status: "completed",
        visitId: visitId,
      };
      const res = await treatmentApi.addFollowUp(treatmentId, followUpData);
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
      const followUpData = {
        status: "missed",
        visitId: visitId,
      };
      const res = await treatmentApi.addFollowUp(treatmentId, followUpData);
      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ADD VISIT
export const addVisit = createAsyncThunk(
  "treatments/addVisit",
  async ({ treatmentId, visitData }, thunkAPI) => {
    try {
      const res = await treatmentApi.addFollowUp(treatmentId, visitData);
      return normalizeTreatment(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// CRUD THUNKS
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

// SLICE
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
    /* --- FETCH ALL --- */
    builder
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
        if (action.payload?._id) state.treatments.unshift(action.payload);
      })
      /* --- UPDATE --- */
      .addCase(updateTreatment.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?._id) {
          const index = state.treatments.findIndex(t => t._id === updated._id);
          if (index !== -1) {
            state.treatments[index] = updated;
            if (state.selected?._id === updated._id) {
              state.selected = updated;
            }
          }
        }
      })
      /* --- ADD VISIT --- */
      .addCase(addVisit.fulfilled, (state, action) => {
        const addedVisit = action.payload;
        // Update the treatment in the main list
        const index = state.treatments.findIndex(t => t._id === addedVisit._id);
        if (index !== -1) {
          state.treatments[index] = addedVisit;
        }
        // Update the selected treatment detail
        if (state.selected?._id === addedVisit._id) {
          state.selected = addedVisit;
        }
      })
      /* --- MARK COMPLETED (Now updates the treatment object after adding follow-up) --- */
      .addCase(markVisitCompleted.fulfilled, (state, action) => {
        const updatedTreatment = action.payload;
        if (updatedTreatment?._id) {
          // Update the treatment in the main list
          const index = state.treatments.findIndex(t => t._id === updatedTreatment._id);
          if (index !== -1) {
            state.treatments[index] = updatedTreatment;
          }
          // Update the selected treatment detail
          if (state.selected?._id === updatedTreatment._id) {
            state.selected = updatedTreatment;
          }
        }
      })
      /* --- MARK MISSED (Now updates the treatment object after adding follow-up) --- */
      .addCase(markVisitMissed.fulfilled, (state, action) => {
        const updatedTreatment = action.payload;
        if (updatedTreatment?._id) {
          // Update the treatment in the main list
          const index = state.treatments.findIndex(t => t._id === updatedTreatment._id);
          if (index !== -1) {
            state.treatments[index] = updatedTreatment;
          }
          // Update the selected treatment detail
          if (state.selected?._id === updatedTreatment._id) {
            state.selected = updatedTreatment;
          }
        }
      })
      /* --- ARCHIVE --- */
      .addCase(archiveTreatment.fulfilled, (state, action) => {
        const archived = action.payload;
        if (archived?._id) {
          state.treatments = state.treatments.filter(t => t._id !== archived._id);
        }
      });
  },
});

// Expose actions for external components
export const { clearSelectedTreatment } = treatmentSlice.actions;
//export { addVisit };

export default treatmentSlice.reducer;