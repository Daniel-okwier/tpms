// TreatmentDashboard.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer 
} from 'recharts';

// Redux selector
const selectTreatmentState = (state) => state.treatments;

// Utility functions for data transformation
const prepareStatusData = (treatments) => {
    if (!Array.isArray(treatments)) return [];

    const statusCounts = treatments.reduce((acc, t) => {
        const status = t.status || 'planned';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return Object.keys(statusCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: statusCounts[key],
    }));
};

const prepareRegimenOutcomeData = (treatments) => {
    if (!Array.isArray(treatments)) return [];

    const outcomeByRegimen = treatments.reduce((acc, t) => {
        const regimen = t.regimen || 'Unknown';
        if (!acc[regimen]) {
            acc[regimen] = { name: regimen, completed: 0, defaulted: 0, failed: 0 };
        }
        acc[regimen][t.status] = (acc[regimen][t.status] || 0) + 1;
        return acc;
    }, {});

    return Object.values(outcomeByRegimen);
};

// Color constants for charts
const COLORS = {
    ongoing: '#0088FE',
    completed: '#00C49F',
    defaulted: '#FFBB28',
    failed: '#FF8042',
    planned: '#A9A9A9'
};

// Visualization components
const StatusDistributionChart = ({ data }) => (
    <div className="p-4 bg-white rounded-lg shadow-md h-96 flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Treatment Status Distribution</h3>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        ) : (
             <p className="text-gray-500 mt-20">No status data available to generate chart.</p>
        )}
    </div>
);

const RegimenOutcomeChart = ({ data }) => (
    <div className="p-4 bg-white rounded-lg shadow-md h-96">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Outcome by Regimen Type</h3>
         {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill={COLORS.completed} name="Completed" />
                    <Bar dataKey="defaulted" stackId="a" fill={COLORS.defaulted} name="Defaulted" />
                    <Bar dataKey="failed" stackId="a" fill={COLORS.failed} name="Failed" />
                </BarChart>
            </ResponsiveContainer>
         ) : (
            <p className="text-gray-500 mt-20 text-center">No regimen outcome data available to generate chart.</p>
         )}
    </div>
);

const TreatmentDashboard = () => {
    // FIX: Destructure safely and ensure treatments is an array
    const { entities, loading } = useSelector(selectTreatmentState) || {};
    const treatments = Object.values(entities || {});

    const statusData = React.useMemo(() => prepareStatusData(treatments), [treatments]);
    const regimenOutcomeData = React.useMemo(() => prepareRegimenOutcomeData(treatments), [treatments]);

    const adherenceStats = React.useMemo(() => {
        let totalScheduled = 0;
        let totalCompleted = 0;

        treatments.forEach(t => {
            if (t.visits) {
                t.visits.forEach(v => {
                    totalScheduled++;
                    if (v.status === 'completed') {
                        totalCompleted++;
                    }
                });
            }
        });

        const adherenceRate = totalScheduled > 0
            ? ((totalCompleted / totalScheduled) * 100).toFixed(1)
            : 0;

        return { totalScheduled, totalCompleted, adherenceRate };
    }, [treatments]);

    const expectedEndNext30Days = React.useMemo(() => {
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        return treatments.filter(t => t.expectedEndDate && new Date(t.expectedEndDate) <= next30Days && new Date(t.expectedEndDate) >= today).length;
    }, [treatments]);

    // Check loading state
    if (loading === 'pending') return <div className="text-center p-8 text-white">Loading Dashboard Data...</div>;
    
    // Check for empty data after loading
    if (treatments.length === 0) return <div className="text-center p-8 text-white text-xl">No treatment data available to display the dashboard.</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-white">Treatment Program Dashboard 📈</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <KPICard title="Total Active Treatments" value={treatments.filter(t => t.status === 'ongoing').length} color="bg-blue-500" />
                <KPICard title="Total Adherence Rate" value={`${adherenceStats.adherenceRate}%`} color="bg-green-500" isHighlight={true} />
                <KPICard title="Patients Defaulted" value={statusData.find(d => d.name === 'Defaulted')?.value || 0} color="bg-yellow-500" />
                <KPICard title="Expected End (Next 30 Days)" value={expectedEndNext30Days} color="bg-purple-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusDistributionChart data={statusData} />
                <RegimenOutcomeChart data={regimenOutcomeData} />
            </div>

            <hr className="my-8 border-gray-600" />
            <h2 className="text-2xl font-bold mb-4 text-white">Actionable Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingVisitsTable treatments={treatments} />
                <HighRiskPatientsTable treatments={treatments} />
            </div>
        </div>
    );
};

// KPI Card Component
const KPICard = ({ title, value, color, isHighlight = false }) => (
    <div className={`${color} text-white p-5 rounded-lg shadow-xl transition transform hover:scale-[1.02] ${isHighlight ? 'border-4 border-white' : ''}`}>
        <p className="text-sm font-light opacity-80">{title}</p>
        <p className="text-4xl font-extrabold mt-1">{value}</p>
    </div>
);

// Upcoming Visits Table
const UpcomingVisitsTable = ({ treatments }) => {
    const safeTreatments = Array.isArray(treatments) ? treatments : [];
    
    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Visits Due (Next 7 Days) 🗓️</h3>
            <p className="text-gray-600">Details will be filtered based on visit dates.</p>
            {/* Implementation using safeTreatments */}
        </div>
    );
};

// High-Risk Patients Table
const HighRiskPatientsTable = ({ treatments }) => {
    const safeTreatments = Array.isArray(treatments) ? treatments : [];
    // ... filtering logic for defaulted/failed treatments goes here ...
    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">4. High Risk (Defaulted/Failed)</h3>
            <p className="text-gray-600">List of patients with status 'defaulted' or 'failed' for review.</p>
            {/* Implementation using safeTreatments */}
        </div>
    );
};

export default TreatmentDashboard;