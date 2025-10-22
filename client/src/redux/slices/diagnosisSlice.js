import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import diagnosisApi from '../../services/diagnosisApi';

// Fetch all diagnoses
export const fetchDiagnoses = createAsyncThunk('diagnosis/fetchAll', async (_, thunkAPI) => {
  try {
    const { data } = await diagnosisApi.getAll();
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch one diagnosis by ID
export const fetchDiagnosisById = createAsyncThunk('diagnosis/fetchById', async (id, thunkAPI) => {
  try {
    const { data } = await diagnosisApi.getById(id);
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Create diagnosis
export const createDiagnosis = createAsyncThunk('diagnosis/create', async (payload, thunkAPI) => {
  try {
    const { data } = await diagnosisApi.create(payload);
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

// Update diagnosis
export const updateDiagnosis = createAsyncThunk('diagnosis/update', async ({ id, updates }, thunkAPI) => {
  try {
    const { data } = await diagnosisApi.update(id, updates);
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

// Delete diagnosis
export const deleteDiagnosis = createAsyncThunk('diagnosis/delete', async (id, thunkAPI) => {
  try {
    await diagnosisApi.remove(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

const diagnosisSlice = createSlice({
  name: 'diagnosis',
  initialState: {
    diagnoses: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedDiagnosis: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiagnoses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiagnoses.fulfilled, (state, action) => {
        state.loading = false;
        state.diagnoses = action.payload;
      })
      .addCase(fetchDiagnoses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDiagnosisById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createDiagnosis.fulfilled, (state, action) => {
        state.diagnoses.unshift(action.payload);
      })
      .addCase(updateDiagnosis.fulfilled, (state, action) => {
        const idx = state.diagnoses.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.diagnoses[idx] = action.payload;
      })
      .addCase(deleteDiagnosis.fulfilled, (state, action) => {
        state.diagnoses = state.diagnoses.filter((d) => d._id !== action.payload);
      });
  },
});

export const { clearSelectedDiagnosis } = diagnosisSlice.actions;
export default diagnosisSlice.reducer;
