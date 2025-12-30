import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import prescriptionApi from '../../services/prescriptionService'; 

// Async thunk to fetch prescriptions
export const fetchPrescriptions = createAsyncThunk('prescriptions/fetchPrescriptions', async () => {
    const data = await prescriptionApi.fetchPrescriptions();
    return data;
});

// Async thunk to create a prescription
export const createPrescription = createAsyncThunk('prescriptions/createPrescription', async (prescriptionData) => {
    const data = await prescriptionApi.createPrescription(prescriptionData);
    return data;
});

// Async thunk to update a prescription
export const updatePrescription = createAsyncThunk('prescriptions/updatePrescription', async ({ id, updateData }) => {
    const data = await prescriptionApi.updatePrescription(id, updateData);
    return data;
});

// Async thunk to delete a prescription
export const deletePrescription = createAsyncThunk('prescriptions/deletePrescription', async (id) => {
    await prescriptionApi.deletePrescription(id);
    return id;
});

const prescriptionSlice = createSlice({
    name: 'prescriptions',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearPrescriptionMessages(state) {
            // Reset the error state
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPrescriptions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPrescriptions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchPrescriptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createPrescription.fulfilled, (state, action) => {
                state.items.push(action.payload); // Add new prescription to the state
            })
            .addCase(updatePrescription.fulfilled, (state, action) => {
                const index = state.items.findIndex(p => p._id === action.payload._id);
                if (index >= 0) {
                    state.items[index] = action.payload; 
                }
            })
            .addCase(deletePrescription.fulfilled, (state, action) => {
                state.items = state.items.filter(p => p._id !== action.payload);
            });
    },
});

// Export the action creators
export const { clearPrescriptionMessages } = prescriptionSlice.actions;

// Export the reducer
export default prescriptionSlice.reducer;