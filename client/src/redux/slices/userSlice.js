import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";
const BASE_USERS_URL = `${API_URL}/users`; // Standardizing user endpoint


// --- New Async Thunk for Radiologists ---
export const fetchRadiologists = createAsyncThunk(
    "users/fetchRadiologists",
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            // Fetch users, filtered by a 'role=radiologist' query parameter
            const res = await axios.get(`${BASE_USERS_URL}?role=radiologist`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            return res.data;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to fetch radiologist list.';
            return rejectWithValue(message);
        }
    }
);


// Async thunks (Existing)

export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { getState }) => {
    const { auth } = getState();
    const res = await axios.get(BASE_USERS_URL, {
        headers: { Authorization: `Bearer ${auth.token}` },
    });
    return res.data;
});

export const addUser = createAsyncThunk("users/add", async (userData, { getState }) => {
    const { auth } = getState();
    const res = await axios.post(`${API_URL}/create-user`, userData, {
        headers: { Authorization: `Bearer ${auth.token}` },
    });
    return res.data.user;
});

export const removeUser = createAsyncThunk("users/remove", async (id, { getState }) => {
    const { auth } = getState();
    await axios.delete(`${BASE_USERS_URL}/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
    });
    return id;
});


const userSlice = createSlice({
    name: "users",
    initialState: {
        list: [], // All users
        radiologists: [], // Specialized list for Radiology Form
        loading: false,
        isRadiologistsLoading: false, // Dedicated loading state
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetch users (Existing)
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // add user (Existing)
            .addCase(addUser.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })

            // remove user (Existing)
            .addCase(removeUser.fulfilled, (state, action) => {
                state.list = state.list.filter((u) => u._id !== action.payload);
            })
            
            // --- Handlers for fetchRadiologists (NEW) ---
            .addCase(fetchRadiologists.pending, (state) => {
                state.isRadiologistsLoading = true;
                state.error = null;
            })
            .addCase(fetchRadiologists.fulfilled, (state, action) => {
                state.isRadiologistsLoading = false;
                state.radiologists = action.payload; // Store the list here
            })
            .addCase(fetchRadiologists.rejected, (state, action) => {
                state.isRadiologistsLoading = false;
                state.error = action.payload;
                state.radiologists = [];
            });
    },
});

export default userSlice.reducer;
