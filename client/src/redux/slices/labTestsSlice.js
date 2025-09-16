import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const adapter = createEntityAdapter({
  selectId: (test) => test._id,
  sortComparer: (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
});

const initialState = adapter.getInitialState({
  loading: 'idle',
  error: null,
  total: 0,
  page: 1,
  limit: 12,
  filters: {
    q: '',
    testType: '',
    status: ''
  },
  sortBy: 'orderDate',
  sortDir: 'desc'
});

const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state?.auth?.token || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch lab tests
export const fetchLabTests = createAsyncThunk(
  'labTests/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const params = {
        page: state.labTests.page,
        limit: state.labTests.limit,
        q: state.labTests.filters.q || undefined,
        testType: state.labTests.filters.testType || undefined,
        status: state.labTests.filters.status || undefined,
        sortBy: state.labTests.sortBy,
        sortDir: state.labTests.sortDir
      };
      const res = await axios.get('/api/lab-tests', {
        params,
        headers: getAuthHeaders(getState)
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete lab test
export const deleteLabTest = createAsyncThunk(
  'labTests/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`/api/lab-tests/${id}`, {
        headers: getAuthHeaders(getState)
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const labTestsSlice = createSlice({
  name: 'labTests',
  initialState,
  reducers: {
    resetFilters(state) {
      state.filters = { q: '', testType: '', status: '' };
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        adapter.setAll(state, action.payload.data);
        state.total = action.payload.total;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteLabTest.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload);
        state.total -= 1;
      })
      .addCase(deleteLabTest.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  }
});

export const { resetFilters, setPage, setFilters } = labTestsSlice.actions;
export const labTestsSelectors = adapter.getSelectors((state) => state.labTests);
export default labTestsSlice.reducer;
