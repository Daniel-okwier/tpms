import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reportApi from "../../services/reportApi"; 


const initialState = {
    // Operational data state
    dashboard: null,
    trends: null, 
    loading: "idle",
    error: null,
    
    // Download specific state
    downloading: false, 
    downloadError: null,
};

// Helper for auth header 
const getAuthHeaders = (getState) => {
    const token = getState()?.auth?.token || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/* --- Async Thunks for Operational Data --- */

export const fetchDashboardData = createAsyncThunk(
    "reports/fetchDashboardData",
    async (filters = {}, { getState, rejectWithValue }) => {
        try {
            const headers = getAuthHeaders(getState);
            const response = await reportApi.getDashboardData(filters, { headers });
            return response.data?.data; 
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch dashboard data");
        }
    }
);

export const fetchTrends = createAsyncThunk(
    "reports/fetchTrends",
    async (filters = {}, { getState, rejectWithValue }) => {
        try {
            const headers = getAuthHeaders(getState);
            const response = await reportApi.getTrends(filters, { headers });
            return response.data?.data; 
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch trends data");
        }
    }
);

/* --- Async Thunk for PDF Download (FIXED Error Handling) --- */

export const downloadPublicHealthReport = createAsyncThunk(
    "reports/downloadPublicHealthReport",
    async (filters = {}, { getState, rejectWithValue }) => {
        try {
            const headers = getAuthHeaders(getState);
            const response = await reportApi.downloadReport(filters, { headers });
            
            // Returns the raw ArrayBuffer for the component to handle.
            return response.data; 
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                try {
                    // ✅ FIX: Use TextDecoder (Browser Native API) to convert the ArrayBuffer error data to a string
                    const decoder = new TextDecoder('utf-8');
                    const errorText = decoder.decode(errorData);
                    
                    const errorJson = JSON.parse(errorText);
                    return rejectWithValue(errorJson.message || "Failed to generate PDF report.");
                } catch (e) {
                    return rejectWithValue("Failed to generate PDF report due to unexpected server error format.");
                }
            }
            return rejectWithValue(err.message || "Failed to generate PDF report.");
        }
    }
);


/* --- Slice Definition --- */

const reportSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {
        clearReportMessages(state) {
            state.error = null;
            state.downloadError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* Fetch Dashboard Data */
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = "pending";
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.dashboard = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload;
            })

            /* Fetch Trends */
            .addCase(fetchTrends.pending, (state) => {
                state.loading = "pending";
                state.error = null;
            })
            .addCase(fetchTrends.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.trends = action.payload;
            })
            .addCase(fetchTrends.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload;
            })

            /* Download Report */
            .addCase(downloadPublicHealthReport.pending, (state) => {
                state.downloading = true;
                state.downloadError = null;
            })
            .addCase(downloadPublicHealthReport.fulfilled, (state) => {
                state.downloading = false;
            })
            .addCase(downloadPublicHealthReport.rejected, (state, action) => {
                state.downloading = false;
                state.downloadError = action.payload;
            });
    },
});

export const { clearReportMessages } = reportSlice.actions;
export default reportSlice.reducer;