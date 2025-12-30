import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/axios";

// Thunks
export const fetchPatients = createAsyncThunk(
    "patients/fetch",
    async (params = { page: 1, limit: 20 }, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/patients?page=${params.page}&limit=${params.limit}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

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

export const updatePatient = createAsyncThunk(
    "patients/update",
    async ({ id, ...updates }, { rejectWithValue }) => {
        try {
            // Passing updates directly as the body
            const { data } = await api.put(`/patients/${id}`, updates);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

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
        loading: true, // Crucial: starts true to handle the refresh gap
        error: null,
        page: 1,
        pages: 1,
    },
    reducers: {
        clearPatientMessages: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* Fetch Patients */
            .addCase(fetchPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.loading = false;
                // Supports both { patients: [], pages: 1 } and direct array responses
                state.items = action.payload.patients || action.payload || [];
                state.page = action.payload.page || 1;
                state.pages = action.payload.pages || 1;
            })
            .addCase(fetchPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            /* Create Patient */
            .addCase(createPatient.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            /* Update Patient */
            .addCase(updatePatient.fulfilled, (state, action) => {
                state.items = state.items.map((p) =>
                    p._id === action.payload._id ? action.payload : p
                );
            })
            /* Archive Patient */
            .addCase(archivePatient.fulfilled, (state, action) => {
                state.items = state.items.filter((p) => p._id !== action.payload._id);
            })
            /* Search Patients (Server-side fallback) */
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

export const { clearPatientMessages } = patientSlice.actions;
export default patientSlice.reducer;