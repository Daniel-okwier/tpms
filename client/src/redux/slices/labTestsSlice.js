import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "@/utils/axios";

const adapter = createEntityAdapter({
  selectId: (test) => test._id,
  sortComparer: (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
});

const initialState = adapter.getInitialState({
  loading: "idle",
  error: null,
  successMessage: null,
  total: 0,
  page: 1,
  limit: 12,
  filters: { q: "", testType: "", status: "" },
  sortBy: "orderDate",
  sortDir: "desc",
});

const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state?.auth?.token || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch lab tests
export const fetchLabTests = createAsyncThunk(
  "labTests/fetch",
  async (opts = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const params = {
        page: opts.page ?? state.labTests.page,
        limit: opts.limit ?? state.labTests.limit,
        q: opts.q ?? state.labTests.filters.q,
        testType: opts.testType ?? state.labTests.filters.testType,
        status: opts.status ?? state.labTests.filters.status,
        sortBy: opts.sortBy ?? state.labTests.sortBy,
        sortDir: opts.sortDir ?? state.labTests.sortDir,
      };

      const headers = getAuthHeaders(getState);
      const response = await api.get("/lab-tests", { params, headers });
      const data = response.data?.data || response.data?.labTests || response.data || [];
      const count = response.data?.count ?? (Array.isArray(data) ? data.length : 0);

      return { data, count };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch lab tests.");
    }
  }
);

// Fetch lab tests by patient
export const fetchLabTestsByPatient = createAsyncThunk(
  "labTests/fetchByPatient",
  async (patientId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.get(`/lab-tests/patient/${patientId}`, { headers });
      return response.data?.data || response.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch lab tests for patient.");
    }
  }
);

// Create multiple lab tests
export const createLabTests = createAsyncThunk(
  "labTests/createMany",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { patientId, tests } = payload;
      const headers = getAuthHeaders(getState);

      const response = await api.post(
        "/lab-tests/multiple",
        { patientId, tests },
        { headers }
      );

      // normalize backend response
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to create lab tests.");
    }
  }
);

// Update lab test
export const updateLabTest = createAsyncThunk(
  "labTests/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.put(`/lab-tests/${id}`, updates, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update lab test.");
    }
  }
);

// Delete lab test
export const deleteLabTest = createAsyncThunk(
  "labTests/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      await api.delete(`/lab-tests/${id}`, { headers });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete lab test.");
    }
  }
);

const labTestsSlice = createSlice({
  name: "labTests",
  initialState,
  reducers: {
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setFilters(state, action) {
      state.filters = action.payload;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.setAll(state, action.payload.data);
        state.total = action.payload.count;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // FETCH BY PATIENT
      .addCase(fetchLabTestsByPatient.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchLabTestsByPatient.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.setAll(state, action.payload);
        state.total = action.payload.length;
      })
      .addCase(fetchLabTestsByPatient.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // CREATE MANY
      .addCase(createLabTests.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createLabTests.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.addMany(state, action.payload);
        state.successMessage = "Lab tests created successfully.";
      })
      .addCase(createLabTests.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateLabTest.fulfilled, (state, action) => {
        if (action.payload) adapter.upsertOne(state, action.payload);
        state.successMessage = "Lab test updated successfully.";
      })

      // DELETE
      .addCase(deleteLabTest.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload);
        state.successMessage = "Lab test deleted successfully.";
      });
  },
});

export const { setFilters, setPage, clearMessages } = labTestsSlice.actions;
export const labTestsSelectors = adapter.getSelectors((state) => state.labTests);
export default labTestsSlice.reducer;
