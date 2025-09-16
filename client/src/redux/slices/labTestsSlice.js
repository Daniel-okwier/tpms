import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const adapter = createEntityAdapter({
  selectId: (test) => test._id,
  sortComparer: (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
});

const initialState = adapter.getInitialState({
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
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
  sortDir: 'desc',
});

// Helper to build auth headers (falls back to localStorage token)
const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state?.auth?.token || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch lab tests with optional params
export const fetchLabTests = createAsyncThunk(
  'labTests/fetch',
  async (opts = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const params = {
        page: opts.page ?? state.labTests.page,
        limit: opts.limit ?? state.labTests.limit,
        q: opts.q ?? state.labTests.filters.q || undefined,
        testType: opts.testType ?? state.labTests.filters.testType || undefined,
        status: opts.status ?? state.labTests.filters.status || undefined,
        sortBy: opts.sortBy ?? state.labTests.sortBy,
        sortDir: opts.sortDir ?? state.labTests.sortDir,
      };

      return params; 
      return rejectWithValue(error.response.data); 
    }
  }
); 

export default labTestsSlice.reducer; 