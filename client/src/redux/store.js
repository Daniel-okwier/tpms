import { configureStore } from "@reduxjs/toolkit";

// Import slice reducers
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import patientReducer from "./slices/patientSlice";
import screeningsReducer from "./slices/screeningSlice";
import labTestsReducer from "./slices/labTestsSlice";
import diagnosisReducer from "./slices/diagnosisSlice";
import treatmentReducer from "./slices/treatmentSlice";
import reportReducer from "./slices/reportSlice";
import drugReducer from "./slices/drugSlice";
import prescriptionReducer from "./slices/prescriptionSlice"; 
import radiologyReducer from './slices/radiologySlice';

const rootReducer = {
    auth: authReducer,
    users: userReducer,
    patients: patientReducer,
    screenings: screeningsReducer,
    labTests: labTestsReducer,
    diagnosis: diagnosisReducer,
    treatments: treatmentReducer,
    reports: reportReducer,
    drugs: drugReducer,
    prescriptions: prescriptionReducer,
    radiology: radiologyReducer,
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['reports/downloadPublicHealthReport/fulfilled'],
            },
        }),
});

export default store;