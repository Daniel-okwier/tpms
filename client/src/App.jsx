import React, { useEffect } from "react"; 
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreSession } from "@/redux/slices/authSlice";

// Components
import ToastConfig from "@/components/shared/ToastConfig";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

// Public pages
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";
import ForgotPassword from "@/pages/ForgotPassword";

// Protected pages
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/ManagePatients"; 
import PatientDetails from "@/pages/PatientDetails"; 
import Diagnosis from "@/pages/Diagnosis";
import LabTests from "@/pages/LabTests";
import ScreeningsDashboard from "@/pages/ScreeningsDashboard"; 
import Appointments from "@/pages/Appointments";
import Treatments from "@/pages/Treatments";

// Admin & Core Module Imports
import ManageUsers from "@/pages/admin/ManageUsers";
import UserDetails from "@/pages/admin/UserDetails"; // New Import for User Detail View
import ManageDrugs from "@/pages/ManageDrugs"; 
import ManageRadiology from "@/pages/RadiologyDashboard"; 

// Report Imports
import ReportsCenterLanding from "@/pages/ReportsCenterLanding"; 
import DashboardMetrics from "@/pages/DashboardMetrics"; 
import ReportGeneratorScreen from "@/pages/ReportGeneratorScreen"; 

export default function App() {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(restoreSession());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-blue-800 text-white">
                <div className="flex flex-col items-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-white/20 border-t-white h-12 w-12 mb-4 animate-spin"></div>
                    <p className="font-bold tracking-widest text-sm uppercase">Initializing System...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Routes>
                {/* Public Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Main Private Application Shell */}
                <Route element={<MainLayout />}>
                    
                    {/* General Access Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute roles={["admin", "doctor", "nurse", "lab_staff", "pharmacist"]}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    /> 

                    {/* Patient Management Flow */}
                    <Route
                        path="/patients"
                        element={
                            <ProtectedRoute roles={["doctor", "nurse", "admin"]}>
                                <Patients />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patients/:id"
                        element={
                            <ProtectedRoute roles={["doctor", "nurse", "admin", "lab_staff"]}>
                                <PatientDetails />
                            </ProtectedRoute>
                        }
                    />

                    {/* Clinical Modules */}
                    <Route
                        path="/diagnosis"
                        element={
                            <ProtectedRoute roles={["doctor", "nurse"]}>
                                <Diagnosis />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/labtests"
                        element={
                            <ProtectedRoute roles={["lab_staff", "doctor"]}>
                                <LabTests />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/screenings"
                        element={
                            <ProtectedRoute roles={["doctor", "nurse"]}> 
                                <ScreeningsDashboard /> 
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/appointments"
                        element={
                            <ProtectedRoute roles={["doctor", "nurse", "admin"]}>
                                <Appointments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/treatments"
                        element={
                            <ProtectedRoute roles={["doctor"]}>
                                <Treatments />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Specialized Modules */}
                    <Route
                        path="/pharmacy"
                        element={
                            <ProtectedRoute roles={["admin", "pharmacist"]}>
                                <ManageDrugs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/radiology"
                        element={
                            <ProtectedRoute roles={["admin", "doctor", "lab_staff", "radiologist"]}> 
                                <ManageRadiology /> 
                            </ProtectedRoute>
                        }
                    /> 

                    {/* Admin & User Management */}
                    <Route
                        path="/manage-users"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <ManageUsers />
                            </ProtectedRoute>
                        }
                    />
                    {/* New User Detail Route */}
                    <Route
                        path="/users/:id"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <UserDetails />
                            </ProtectedRoute>
                        }
                    />

                    {/* Reporting Center */}
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <ReportsCenterLanding /> 
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/dashboard"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <DashboardMetrics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/generator" 
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <ReportGeneratorScreen />
                            </ProtectedRoute>
                        }
                    />

                </Route>
            </Routes>

            <ToastConfig />
        </>
    );
}