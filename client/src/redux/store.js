import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import patientReducer from "./slices/patientSlice";
import labTestsReducer from "./slices/labTestsSlice"; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    patients: patientReducer,
    labTests: labTestsReducer, 
  },
});

export default store;
