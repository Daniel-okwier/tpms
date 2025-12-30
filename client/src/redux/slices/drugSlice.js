import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import drugApi from '../../services/drugApi.js';

// Async thunk to fetch drugs
export const fetchDrugs = createAsyncThunk('drugs/fetchDrugs', async (filters) => {
    const data = await drugApi.fetchDrugs(filters);
    return data;
});

// Async thunk to create a drug
export const createDrug = createAsyncThunk('drugs/createDrug', async (drugData) => {
    const data = await drugApi.createDrug(drugData);
    return data;
});

// Async thunk to update a drug
export const updateDrug = createAsyncThunk('drugs/updateDrug', async ({ id, updateData }) => {
    const data = await drugApi.updateDrug(id, updateData);
    return data;
});

// Async thunk to delete a drug
export const deleteDrug = createAsyncThunk('drugs/deleteDrug', async (id) => {
    await drugApi.deleteDrug(id);
    return id; // Return the ID for Redux state cleanup
});

const drugSlice = createSlice({
    name: 'drugs',
    initialState: {
        items: [],
        loading: false,
        error: null,
        messages: null, // For success/error messages
    },
    reducers: {
        clearDrugMessages(state) {
            state.messages = null; // Clear messages
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDrugs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDrugs.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.messages = "Drugs fetched successfully."; // Example success message
            })
            .addCase(fetchDrugs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.messages = null; // Reset messages on error
            })
            .addCase(createDrug.fulfilled, (state, action) => {
                state.items.push(action.payload); // Add new drug to the state
                state.messages = "Drug created successfully."; 
            })
            .addCase(updateDrug.fulfilled, (state, action) => {
                const index = state.items.findIndex(drug => drug._id === action.payload._id);
                if (index >= 0) {
                    state.items[index] = action.payload; 
                    state.messages = "Drug updated successfully."; 
                }
            })
            .addCase(deleteDrug.fulfilled, (state, action) => {
                state.items = state.items.filter(drug => drug._id !== action.payload);
                state.messages = "Drug deleted successfully."; 
            });
    },
});

export const { clearDrugMessages } = drugSlice.actions; 
export default drugSlice.reducer; 