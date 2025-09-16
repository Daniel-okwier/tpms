// src/redux/slices/labTestsSlice.js
import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "@/utils/axios"; // ✅ use the custom axios instance

// Entity adapter for normalized data
const adapter = createEntityAdapter({
  selectId: (test) => test._id,
  sortComparer: (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
});

// Initial state
const initialState = adapter.getInitialState({
  loading: "idle", // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
  total: 0,
  page: 1,
  limit: 12,
  filters: {
    q: "",
    testType: "",
    status: "",
  },
  sortBy: "orderDate",
  sortDir: "desc",
});

// Helper to get auth headers
const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state?.auth?.token || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


// Async Thunks

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

      return {
        data: response.data?.data || [],
        count: response.data?.count ?? 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create a lab test
export const createLabTest = createAsyncThunk(
  "labTests/create",
  async (data, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.post("/lab-tests", data, { headers });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update a lab test
export const updateLabTest = createAsyncThunk(
  "labTests/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.put(`/lab-tests/${id}`, updates, { headers });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete a lab test
export const deleteLabTest = createAsyncThunk(
  "labTests/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      await api.delete(`/lab-tests/${id}`, { headers });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice
const labTestsSlice = createSlice({
  name: "labTests",
  initialState,
  reducers: {
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
      // Fetch
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.setAll(state, action.payload.data || []);
        state.total = action.payload.count ?? action.payload.data.length;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // Create
      .addCase(createLabTest.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(createLabTest.fulfilled, (state, action) => {
        state.loading = "succeeded";
        if (action.payload) adapter.addOne(state, action.payload);
      })
      .addCase(createLabTest.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateLabTest.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateLabTest.fulfilled, (state, action) => {
        state.loading = "succeeded";
        if (action.payload) adapter.upsertOne(state, action.payload);
      })
      .addCase(updateLabTest.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteLabTest.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(deleteLabTest.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.removeOne(state, action.payload);
      })
      .addCase(deleteLabTest.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      });
  },
});

export const { setFilters, setPage } = labTestsSlice.actions;
export const labTestsSelectors = adapter.getSelectors((state) => state.labTests);
export default labTestsSlice.reducer;
