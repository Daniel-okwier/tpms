import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "@/utils/axios";

const adapter = createEntityAdapter({
  selectId: (test) => test._id,
  sortComparer: (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
});

const initialState = adapter.getInitialState({
  loading: "idle",
  error: null,
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

// Fetch all lab tests
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

      const records =
        response.data?.data ||
        response.data?.labTests ||
        response.data ||
        [];
      const count =
        response.data?.count ??
        (Array.isArray(records) ? records.length : 0);

      return { data: records, count };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

//  Create multiple tests 
export const createLabTests = createAsyncThunk(
  "labTests/createMany",
  async ({ patientId, tests }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.post("/lab-tests/multiple", { patientId, tests }, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
      return rejectWithValue(err.response?.data || err.message);
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
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

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
      // Fetch all
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = "succeeded";
        const records = action.payload.data || [];
        adapter.setAll(state, records);
        state.total = action.payload.count ?? records.length;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // Fetch by patient
      .addCase(fetchLabTestsByPatient.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchLabTestsByPatient.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.setAll(state, action.payload);
        state.total = action.payload.length ?? 0;
      })
      .addCase(fetchLabTestsByPatient.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // Create multiple tests
      .addCase(createLabTests.fulfilled, (state, action) => {
        state.loading = "succeeded";
        if (Array.isArray(action.payload)) {
          adapter.addMany(state, action.payload);
        } else if (action.payload) {
          adapter.addOne(state, action.payload);
        }
      })
      .addCase(createLabTests.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(createLabTests.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateLabTest.fulfilled, (state, action) => {
        state.loading = "succeeded";
        if (action.payload) adapter.upsertOne(state, action.payload);
      })

      // Delete
      .addCase(deleteLabTest.fulfilled, (state, action) => {
        state.loading = "succeeded";
        adapter.removeOne(state, action.payload);
      });
  },
});

export const { setFilters, setPage } = labTestsSlice.actions;
export const labTestsSelectors = adapter.getSelectors((state) => state.labTests);
export default labTestsSlice.reducer;