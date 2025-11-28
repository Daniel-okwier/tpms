import React from 'react';
import { useSelector } from 'react-redux';
import { 
    PieChart, Pie, Cell, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts'; // Assuming Recharts

const selectTreatmentState = (state) => state.treatments;

// --- UTILITY FUNCTIONS FOR DATA TRANSFORMATION ---

const prepareStatusData = (treatments) => {
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
    const outcomeByRegimen = treatments.reduce((acc, t) => {
        const regimen = t.regimen || 'Unknown';
        if (!acc[regimen]) {
            acc[regimen] = { name: regimen, completed: 0, defaulted: 0, failed: 0 };
        }
        acc[regimen][t.status] = (acc[regimen][t.status] || 0) + 1;
        return acc;
    }, {});
    
    // Convert map to array for BarChart
    return Object.values(outcomeByRegimen);
};

const COLORS = {
    ongoing: '#0088FE',
    completed: '#00C49F',
    defaulted: '#FFBB28',
    failed: '#FF8042',
    planned: '#A9A9A9'
};


// --- VISUALIZATION COMPONENTS ---

const StatusDistributionChart = ({ data }) => (
    <div className="p-4 bg-white rounded-lg shadow-md h-96">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Treatment Status Distribution</h3>
        <PieChart width={400} height={300}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
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
    </div>
);

const RegimenOutcomeChart = ({ data }) => (
    <div className="p-4 bg-white rounded-lg shadow-md h-96">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Outcome by Regimen Type 🧪</h3>
        <BarChart
            width={600}
            height={300}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill={COLORS.completed} name="Completed" />
            <Bar dataKey="defaulted" stackId="a" fill={COLORS.defaulted} name="Defaulted" />
            <Bar dataKey="failed" stackId="a" fill={COLORS.failed} name="Failed" />
        </BarChart>
    </div>
);


const TreatmentDashboard = () => {
    // Note: fetchTreatments should be dispatched in TreatmentList or a parent component
    const { treatments, loading } = useSelector(selectTreatmentState);

    const statusData = React.useMemo(() => prepareStatusData(treatments), [treatments]);
    const regimenOutcomeData = React.useMemo(() => prepareRegimenOutcomeData(treatments), [treatments]);
    
    // Calculate total scheduled, completed, and adherence rate (KPI)
    const adherenceStats = React.useMemo(() => {
        let totalScheduled = 0;
        let totalCompleted = 0;

        treatments.forEach(t => {
            if (t.visits) {
                t.visits.forEach(v => {
                    // Assuming visits array exists and has a status
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

    if (loading) return <div className="text-center p-8 text-white">Loading Dashboard Data...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-white">Treatment Program Dashboard 📈</h1>
            
            {/* ------------------- Section 1: Key Performance Indicators (KPIs) ------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <KPICard title="Total Active Treatments" value={treatments.filter(t => t.status === 'ongoing').length} color="bg-blue-500" />
                <KPICard title="Total Adherence Rate" value={`${adherenceStats.adherenceRate}%`} color="bg-green-500" isHighlight={true} />
                <KPICard title="Patients Defaulted" value={statusData.find(d => d.name === 'Defaulted')?.value || 0} color="bg-yellow-500" />
                <KPICard title="Expected End (Next 30 Days)" value={0} color="bg-purple-500" /> {/* Logic needed for date filtering */}
            </div>

            {/* ------------------- Section 2: Core Visualizations ------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusDistributionChart data={statusData} />
                <RegimenOutcomeChart data={regimenOutcomeData} />
            </div>

            <hr className="my-8 border-gray-600" />
            
            {/* ------------------- Section 3: Detailed Tables/Lists ------------------- */}
            <h2 className="text-2xl font-bold mb-4 text-white">Actionable Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingVisitsTable treatments={treatments} /> 
                <HighRiskPatientsTable treatments={treatments} /> 
            </div>

        </div>
    );
};

// Simple reusable KPI Card Component
const KPICard = ({ title, value, color, isHighlight = false }) => (
    <div className={`${color} text-white p-5 rounded-lg shadow-xl transition transform hover:scale-[1.02] ${isHighlight ? 'border-4 border-white' : ''}`}>
        <p className="text-sm font-light opacity-80">{title}</p>
        <p className="text-4xl font-extrabold mt-1">{value}</p>
    </div>
);

// Placeholder for detailed actionable tables (Needs implementation)
const UpcomingVisitsTable = ({ treatments }) => (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Visits Due (Next 7 Days) 🗓️</h3>
        <p className="text-gray-600">This requires filtering visits data and joining with patient names for quick outreach.</p>
        {/* Render filtered table here */}
    </div>
);

const HighRiskPatientsTable = ({ treatments }) => (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">4. High Risk (Defaulted/Failed) 🚨</h3>
        <p className="text-gray-600">List of patients with status 'defaulted' or 'failed' for review.</p>
        {/* Render filtered table here */}
    </div>
);

export default TreatmentDashboard;