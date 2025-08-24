import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Diagnosis from "./pages/Diagnosis";
import LabTests from "./pages/LabTests";
import Screenings from "./pages/Screenings";
import Appointments from "./pages/Appointments";
import Treatments from "./pages/Treatments";
import Reports from "./pages/Reports";

export default function App() {
  return (
    
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["admin", "doctor", "lab"]}>
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
              <ProtectedRoute roles={["admin", "lab"]}>
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
              <ProtectedRoute roles={["admin", "doctor"]}>
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
        </Route>
      </Routes>
    
  );
}
