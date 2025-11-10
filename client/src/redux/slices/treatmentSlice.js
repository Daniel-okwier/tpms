import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import treatmentApi from "../../services/treatmentApi"; 

const adapter = createEntityAdapter({
  selectId: (t) => t._id,
  sortComparer: (a, b) => new Date(b.start) - new Date(a.start),
});


const initialState = adapter.getInitialState({
  loading: "idle",
  error: null,
  successMessage: null,
  total: 0,
  page: 1,
  limit: 12,
  filters: { q: "", patient: "", status: "" },
  selected: null,
});

// Helper for auth header (mirror other slices)
const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state?.auth?.token || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* Async thunks */

// Fetch list (supports pagination / filters via opts)
export const fetchTreatments = createAsyncThunk(
  "treatments/fetch",
  async (opts = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const params = {
        page: opts.page ?? state.treatments.page,
        limit: opts.limit ?? state.treatments.limit,
        patient: opts.patient ?? state.treatments.filters.patient,
        status: opts.status ?? state.treatments.filters.status,
        q: opts.q ?? state.treatments.filters.q,
      };
      const headers = getAuthHeaders(getState);
      const response = await treatmentApi.getAll(params, { headers });
      const data = response.data?.data || response.data || [];
      const count = response.data?.count ?? (Array.isArray(data) ? data.length : 0);
      return { data, count };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch treatments");
    }
  }
);

// Fetch single treatment by id
export const fetchTreatmentById = createAsyncThunk(
  "treatments/fetchById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await treatmentApi.getById(id, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch treatment");
    }
  }
);

// Create treatment
export const createTreatment = createAsyncThunk(
  "treatments/create",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await treatmentApi.create(payload, { headers });
      const data = response.data?.data?.treatment ?? response.data?.data ?? response.data;
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to create treatment");
    }
  }
);

// Update treatment
export const updateTreatment = createAsyncThunk(
  "treatments/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await treatmentApi.update(id, updates, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to update treatment");
    }
  }
);

// Add follow-up
export const addFollowUp = createAsyncThunk(
  "treatments/addFollowUp",
  async ({ id, followUp }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await treatmentApi.addFollowUp(id, followUp, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to add follow-up");
    }
  }
);

// Complete treatment
export const completeTreatment = createAsyncThunk(
  "treatments/complete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await treatmentApi.complete(id, {}, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to complete treatment");
    }
  }
);

// Archive (soft-delete) treatment
export const archiveTreatment = createAsyncThunk(
  "treatments/archive",
  async (id, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await treatmentApi.archive(id, { headers });
      const data = response.data?.data || response.data;
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to archive treatment");
    }
  }
);

/* Slice */

const treatmentSlice = createSlice({
  name: "treatments",
  initialState,
  reducers: {
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    clearSelected(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchTreatments.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.setAll(state, action.payload.data);
        state.total = action.payload.count;
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // fetch by id
      .addCase(fetchTreatmentById.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchTreatmentById.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.selected = action.payload;
        if (action.payload?._id) adapter.upsertOne(state, action.payload);
      })
      .addCase(fetchTreatmentById.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // create
      .addCase(createTreatment.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTreatment.fulfilled, (state, action) => {
        state.loading = "succeeded";
        const payload = action.payload?.treatment ?? action.payload;
        adapter.addOne(state, payload);
        state.successMessage = "Treatment created successfully.";
      })
      .addCase(createTreatment.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // update
      .addCase(updateTreatment.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateTreatment.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.upsertOne(state, action.payload);
        state.successMessage = "Treatment updated successfully.";
        // keep selected in sync
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateTreatment.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // add follow-up
      .addCase(addFollowUp.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(addFollowUp.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.upsertOne(state, action.payload);
        state.successMessage = "Follow-up added.";
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(addFollowUp.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // complete treatment
      .addCase(completeTreatment.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(completeTreatment.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.upsertOne(state, action.payload);
        state.successMessage = "Treatment completed.";
        if (state.selected && state.selected._id === action.payload._id) state.selected = action.payload;
      })
      .addCase(completeTreatment.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // archive
      .addCase(archiveTreatment.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(archiveTreatment.fulfilled, (state, action) => {
        state.loading = "succeeded";
        // If backend returned updated treatment, upsert; otherwise remove by id if response was id
        const payload = action.payload;
        if (payload?._id) adapter.upsertOne(state, payload);
        else if (typeof payload === "string") adapter.removeOne(state, payload);
        state.successMessage = "Treatment archived.";
      })
      .addCase(archiveTreatment.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearMessages, setFilters, setPage, clearSelected } = treatmentSlice.actions;
export const treatmentSelectors = adapter.getSelectors((state) => state.treatments);
export default treatmentSlice.reducer;
