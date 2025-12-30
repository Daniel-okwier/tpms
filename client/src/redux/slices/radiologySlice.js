import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ FIX 1: Corrected Base URL. Remove the extra "results" part 
// to align with the Express router mounting point.
const API_URL = '/api/radiology/'; 

// --- Async Thunks ---

/**
 * @desc Fetches all radiology studies/results for the dashboard list.
 */
export const fetchStudies = createAsyncThunk(
    'radiology/fetchStudies',
    async (_, { rejectWithValue }) => {
        try {
            // This now correctly calls /api/radiology/ (GET /)
            const response = await axios.get(API_URL);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to fetch studies.';
            return rejectWithValue(message);
        }
    }
);

/**
 * @desc Creates a new study record (e.g., received from a HIS/PACS interface).
 */
export const createStudy = createAsyncThunk(
    'radiology/createStudy',
    async (studyData, { rejectWithValue }) => {
        try {
            // This now correctly calls /api/radiology/ (POST /)
            const response = await axios.post(API_URL, studyData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to create study record.';
            return rejectWithValue(message);
        }
    }
);

/**
 * @desc Updates the interpretation/report fields for a specific study.
 */
export const updateReport = createAsyncThunk(
    'radiology/updateReport',
    async ({ id, reportData }, { rejectWithValue }) => {
        try {
            // This now correctly calls /api/radiology/:id/report (PUT /:id/report)
            const response = await axios.put(`${API_URL}${id}/report`, reportData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to submit report.';
            return rejectWithValue(message);
        }
    }
);

// --- Initial State ---

const initialState = {
    studies: [],
    isLoading: false,
    error: null,
};

// --- Slice Definition ---

const radiologySlice = createSlice({
    name: 'radiology',
    initialState,
    reducers: {
        // Clear any errors/status messages
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- fetchStudies ---
            .addCase(fetchStudies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchStudies.fulfilled, (state, action) => {
                state.isLoading = false;
                state.studies = action.payload;
            })
            .addCase(fetchStudies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.studies = [];
            })

            // --- createStudy ---
            .addCase(createStudy.fulfilled, (state, action) => {
                // Add the new study to the beginning of the list
                state.studies.unshift(action.payload); 
                state.error = null;
            })
            .addCase(createStudy.rejected, (state, action) => {
                state.error = action.payload;
            })

            // --- updateReport ---
            .addCase(updateReport.fulfilled, (state, action) => {
                const index = state.studies.findIndex(
                    study => study._id === action.payload._id
                );
                if (index !== -1) {
                    // Replace the old study object with the updated one
                    state.studies[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateReport.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError } = radiologySlice.actions;
export default radiologySlice.reducer;