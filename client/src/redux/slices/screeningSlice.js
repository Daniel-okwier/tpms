import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "@/utils/axios";

// Entity adapter
const adapter = createEntityAdapter({
  selectId: (s) => s._id,
  sortComparer: (a, b) => new Date(b.screeningDate) - new Date(a.screeningDate),
});

// Initial state
const initialState = adapter.getInitialState({
  loading: "idle",
  error: null,
  total: 0,
  page: 1,
  limit: 12,
  filters: {
    q: "",
    status: "",
    outcome: "",
  },
  sortBy: "screeningDate",
  sortDir: "desc",
});

const getAuthHeaders = (getState) => {
  const token = getState()?.auth?.token || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch screenings
export const fetchScreenings = createAsyncThunk(
  "screenings/fetch",
  async (opts = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const params = {
        page: opts.page ?? state.screenings.page,
        limit: opts.limit ?? state.screenings.limit,
        q: opts.q ?? state.screenings.filters.q,
        status: opts.status ?? state.screenings.filters.status,
        outcome: opts.outcome ?? state.screenings.filters.outcome,
        sortBy: opts.sortBy ?? state.screenings.sortBy,
        sortDir: opts.sortDir ?? state.screenings.sortDir,
      };
      const headers = getAuthHeaders(getState);
      const response = await api.get("/screenings", { params, headers });
      const records = response.data?.data || [];
      const count = response.data?.count ?? (Array.isArray(records) ? records.length : 0);
      return { data: records, count };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create
export const createScreening = createAsyncThunk(
  "screenings/create",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.post("/screenings", payload, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update
export const updateScreening = createAsyncThunk(
  "screenings/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.put(`/screenings/${id}`, updates, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete (hard)
export const deleteScreening = createAsyncThunk(
  "screenings/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      await api.delete(`/screenings/${id}`, { headers });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Void (soft)
export const voidScreening = createAsyncThunk(
  "screenings/void",
  async ({ id, reason }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.post(`/screenings/${id}/void`, { reason }, { headers });
      return response.data?.data || { _id: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const screeningsSlice = createSlice({
  name: "screenings",
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
      .addCase(fetchScreenings.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchScreenings.fulfilled, (state, action) => {
        state.loading = "succeeded";
        const records = action.payload.data || [];
        adapter.setAll(state, records);
        state.total = action.payload.count ?? records.length;
      })
      .addCase(fetchScreenings.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })

      .addCase(createScreening.fulfilled, (state, action) => {
        if (action.payload) adapter.addOne(state, action.payload);
      })

      .addCase(updateScreening.fulfilled, (state, action) => {
        if (action.payload) adapter.upsertOne(state, action.payload);
      })

      .addCase(voidScreening.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload._id || action.payload.id);
      })

      .addCase(deleteScreening.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload);
      });
  },
});

export const { setFilters, setPage } = screeningsSlice.actions;
export const screeningSelectors = adapter.getSelectors((state) => state.screenings);
export default screeningsSlice.reducer;
