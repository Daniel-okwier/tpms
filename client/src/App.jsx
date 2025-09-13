import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreSession } from "@/redux/slices/authSlice";

// Public pages
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";
import ForgotPassword from "@/pages/ForgotPassword";

// Protected pages
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Diagnosis from "@/pages/Diagnosis";
import LabTests from "@/pages/LabTests";
import Screenings from "@/pages/Screenings";
import Appointments from "@/pages/Appointments";
import Treatments from "@/pages/Treatments";
import Reports from "@/pages/Reports";
import ManageUsers from "@/pages/admin/ManageUsers";

// Layout & route protection
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

export default function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-800">
        <div className="flex flex-col items-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-white h-16 w-16 mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>

        <style>
          {`
            .loader {
              border-top-color: #2563eb;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <Routes>
      {/* Default route → Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin", "doctor", "nurse", "lab_staff"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute roles={["admin", "doctor"]}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diagnosis"
          element={
            <ProtectedRoute roles={["admin", "doctor"]}>
              <Diagnosis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labtests"
          element={
            <ProtectedRoute roles={["admin", "lab_staff"]}>
              <LabTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/screenings"
          element={
            <ProtectedRoute roles={["admin", "doctor"]}>
              <Screenings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute roles={["admin", "doctor", "nurse"]}>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/treatments"
          element={
            <ProtectedRoute roles={["admin", "doctor"]}>
              <Treatments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
