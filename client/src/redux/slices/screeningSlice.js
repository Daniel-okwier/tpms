import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "@/utils/axios";

//  Entity Adapter
const adapter = createEntityAdapter({
  selectId: (screening) => screening._id,
  sortComparer: (a, b) => new Date(b.screeningDate) - new Date(a.screeningDate),
});

//  Initial State 
const initialState = adapter.getInitialState({
  loading: "idle", // 'idle' | 'pending' | 'succeeded' | 'failed'
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

//  Helper to add auth headers 
const getAuthHeaders = (getState) => {
  const token = getState()?.auth?.token || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

//  Async Thunks 

// Fetch screenings (with pagination + filters)
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

      // Normalize response
      const records =
        response.data?.data ||
        response.data?.screenings ||
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

// Create screening
export const createScreening = createAsyncThunk(
  "screenings/create",
  async (data, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.post("/screenings", data, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update screening
export const updateScreening = createAsyncThunk(
  "screenings/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.put(`/screenings/${id}`, updates, { headers });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Void (soft delete) screening
export const voidScreening = createAsyncThunk(
  "screenings/void",
  async ({ id, reason }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const response = await api.post(
        `/screenings/${id}/void`,
        { reason },
        { headers }
      );
      return response.data?.data || { _id: id };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice 
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
      // Fetch
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

      // Create
      .addCase(createScreening.fulfilled, (state, action) => {
        if (action.payload) adapter.addOne(state, action.payload);
      })

      // Update
      .addCase(updateScreening.fulfilled, (state, action) => {
        if (action.payload) adapter.upsertOne(state, action.payload);
      })

      // Void
      .addCase(voidScreening.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload._id || action.payload.id);
      });
  },
});

//Exports 
export const { setFilters, setPage } = screeningsSlice.actions;
export const screeningsSelectors = adapter.getSelectors(
  (state) => state.screenings
);
export default screeningsSlice.reducer;
