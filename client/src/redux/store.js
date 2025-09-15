import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice"; 
import patientReducer from "./slices/patientSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    patients:patientReducer
     
  },
});

export default store;
