import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import patientReducer from "./slices/patientSlice";
import screeningsReducer from "./slices/screeningSlice";
import labTestsReducer from "./slices/labTestsSlice"; 
import diagnosisReducer from "./slices/diagnosisSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    patients: patientReducer,
    screenings: screeningsReducer,
    labTests: labTestsReducer, 
    diagnosis: diagnosisReducer,
  },
});

export default store;
