import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import patientReducer from "./slices/patientSlice";
import screeningsReducer from "./slices/screeningSlice";
import labTestsReducer from "./slices/labTestsSlice"; 


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    patients: patientReducer,
    screenings: screeningsReducer,
    labTests: labTestsReducer, 
  },
});

export default store;
