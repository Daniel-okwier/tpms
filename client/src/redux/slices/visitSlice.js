import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axios";

export const fetchPatientVisits = createAsyncThunk(
  "visits/fetchPatient",
  async (patientId, thunkAPI) => {
    try {
      const res = await api.get(`/visits/patient/${patientId}`);
      return res.data?.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const generateNextVisit = createAsyncThunk(
  "visits/generateNext",
  async (treatmentId, thunkAPI) => {
    try {
      const res = await api.post(`/visits/generate/${treatmentId}`);
      return res.data?.data || res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const completeVisit = createAsyncThunk(
  "visits/complete",
  async ({ id, payload }, thunkAPI) => {
    try {
      const res = await api.post(`/visits/${id}/complete`, payload);
      return res.data?.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const missVisit = createAsyncThunk(
  "visits/miss",
  async ({ id, payload }, thunkAPI) => {
    try {
      const res = await api.post(`/visits/${id}/miss`, payload);
      return res.data?.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const slice = createSlice({
  name: "visits",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPatientVisits.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchPatientVisits.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchPatientVisits.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

     .addCase(generateNextVisit.fulfilled, (s, a) => { if (a.payload) s.items.push(a.payload); })
     .addCase(completeVisit.fulfilled, (s, a) => {
        const idx = s.items.findIndex(v => v._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
     })
     .addCase(missVisit.fulfilled, (s, a) => {
        const idx = s.items.findIndex(v => v._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
     });
  }
});

export default slice.reducer;
