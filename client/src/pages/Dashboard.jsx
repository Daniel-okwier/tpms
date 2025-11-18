import React, { useEffect, useState } from "react";
import Card from "../components/shared/Card";
import { Users, Calendar, FileText, FlaskConical } from "lucide-react";
import PieChart from "../components/charts/PieChart";
import LineChart from "../components/charts/LineChart";
import BarChart from "../components/charts/BarChart";
import api from "../utils/axios";
import { useSelector } from "react-redux";
import LoadingSpinner from "../components/shared/LoadingSpinner";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    reports: 0,
    labTests: 0,
  });
  const [chartsData, setChartsData] = useState({
    patientDistribution: [],
    appointmentTrends: [],
    monthlyIntake: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        if (user.role === "admin") {
          const { data } = await api.get("/reports/full-dashboard");
          setStats(data.stats || {});
          setChartsData(data.charts || {});
        } else if (user.role === "doctor") {
          const [patientStats, appointmentMetrics] = await Promise.all([
            api.get("/reports/patient-stats"),
            api.get("/reports/appointments"),
          ]);
          setStats({
            patients: patientStats.data.totalPatients || 0,
            appointments: appointmentMetrics.data.totalAppointments || 0,
            reports: 0,
            labTests: 0,
          });
          setChartsData({
            patientDistribution: patientStats.data.distribution || [],
            appointmentTrends: appointmentMetrics.data.trends || [],
            monthlyIntake: [],
          });
        } else if (user.role === "lab_staff") {
          const { data: labSummary } = await api.get("/reports/lab-summary");
          setStats((prev) => ({
            ...prev,
            labTests: labSummary.totalLabTests || 0,
          }));
          setChartsData((prev) => ({
            ...prev,
            monthlyIntake: labSummary.testsOverTime || [],
          }));
        } else if (user.role === "nurse") {
          const { data: appointmentMetrics } = await api.get("/reports/appointments");
          setStats((prev) => ({
            ...prev,
            appointments: appointmentMetrics.totalAppointments || 0,
          }));
          setChartsData((prev) => ({
            ...prev,
            appointmentTrends: appointmentMetrics.trends || [],
          }));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role) {
      fetchDashboard();
    }
  }, [user]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Patients" value={stats.patients} icon={<Users />} />
        <Card title="Appointments" value={stats.appointments} icon={<Calendar />} />
        <Card title="Reports" value={stats.reports} icon={<FileText />} />
        <Card title="Lab Tests" value={stats.labTests} icon={<FlaskConical />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Patient Distribution
          </h2>
          <PieChart data={chartsData.patientDistribution} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Appointment Trends
          </h2>
          <LineChart data={chartsData.appointmentTrends} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Monthly Intake
        </h2>
        <BarChart data={chartsData.monthlyIntake} />
      </div>
    </div>
  );
}
