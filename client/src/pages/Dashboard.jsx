import React, { useEffect, useState } from "react";
import { BarChart, LineChart, PieChart } from "../components/charts";
import Card from "../components/shared/Card";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    patients: {},
    treatments: {},
    labTests: {},
    appointments: {},
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get("/api/report/full-dashboard");
        setStats(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="p-6 pt-4 space-y-6 ml-64">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Patients" value={stats.patients?.totalPatients || 0} />
        <Card title="Ongoing Treatments" value={stats.treatments?.ongoingTreatments || 0} />
        <Card title="Completed Lab Tests" value={stats.labTests?.completedTests || 0} />
        <Card title="Upcoming Appointments" value={stats.appointments?.upcomingAppointments || 0} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Patients Over Time</h2>
          <LineChart data={stats.patients?.trend || []} dataKey="count" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Treatment Outcomes</h2>
          <BarChart data={stats.treatments?.trend || []} dataKey="count" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Lab Positivity Rate</h2>
          <PieChart data={stats.labTests?.trend || []} dataKey="count" />
        </div>
      </div>
    </div>
  );
}
