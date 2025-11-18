import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/axios";


// Thunks


// Fetch patients with pagination
export const fetchPatients = createAsyncThunk(
  "patients/fetch",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/patients?page=${page}&limit=${limit}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create new patient
export const createPatient = createAsyncThunk(
  "patients/create",
  async (patientData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/patients", patientData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Archive patient
export const archivePatient = createAsyncThunk(
  "patients/archive",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/patients/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update patient
export const updatePatient = createAsyncThunk(
  "patients/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/patients/${id}`, updates);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Search patients by MRN or Name
export const searchPatients = createAsyncThunk(
  "patients/search",
  async ({ mrn, name }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (mrn) query.append("mrn", mrn);
      if (name) query.append("name", name);

      const { data } = await api.get(`/patients/search?${query.toString()}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// Slice

const patientSlice = createSlice({
  name: "patients",
  initialState: {
    items: [],
    loading: false,
    error: null,
    page: 1,
    pages: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.patients;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createPatient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // Update
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.items = state.items.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      // Archive
      .addCase(archivePatient.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload._id);
      })

      // Search
      .addCase(searchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default patientSlice.reducer;
