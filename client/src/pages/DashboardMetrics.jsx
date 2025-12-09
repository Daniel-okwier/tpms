import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Alert } from 'react-bootstrap'; 
import { fetchDashboardData, fetchTrends } from "../redux/slices/reportSlice"; 
import LoadingSpinner from "../components/shared/LoadingSpinner"; 
import { Link } from 'react-router-dom'; 

import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer 
} from 'recharts';

/**
 * Renders the Operational Health Dashboard using aggregated data from the reports slice.
 */

// Color constants for charts
const COLORS = {
    ongoing: '#10B981',
    completed: '#3B82F6',
    failed: '#EF4444',
    trend: '#4F46E5'
};

// --- Helper Functions (omitted for brevity) ---

const prepareOutcomeData = (treatments) => {
    if (!treatments) return [];
    
    const totalFailed = (treatments.failedTreatments || 0) + (treatments.defaultedTreatments || 0);

    return [
        { name: 'Completed', value: treatments.completedTreatments || 0, color: COLORS.completed },
        { name: 'Ongoing', value: treatments.ongoingTreatments || 0, color: COLORS.ongoing },
        { name: 'Failed/Defaulted', value: totalFailed, color: COLORS.failed },
    ].filter(d => d.value > 0);
};

const prepareTrendData = (trends) => {
    if (!trends?.newPatientsTrend) return [];
    return trends.newPatientsTrend.map(t => ({ 
        label: t._id, 
        'New Patients': t.count 
    }));
};

// --- Visualization Components (omitted for brevity) ---

const KPICard = ({ title, value, color, isHighlight = false }) => (
    <div className={`p-6 rounded-xl shadow-lg transition transform hover:scale-[1.01] border-b-4 ${color} ${isHighlight ? 'border-yellow-300' : 'border-opacity-70'}`}>
        <p className="text-sm font-semibold opacity-90 text-white">{title}</p>
        <p className="text-4xl font-extrabold mt-1 text-white">{value}</p>
    </div>
);

const OutcomeDistributionChart = ({ data }) => (
    <div className="p-6 bg-white rounded-xl shadow-xl h-96 flex flex-col items-center">
        <h3 className="text-xl font-bold mb-3 text-gray-900">1. Treatment Outcome Distribution</h3>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} cases`, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        ) : (
            <p className="text-gray-500 mt-20">No outcome data available to generate chart.</p>
        )}
    </div>
);

const NewCaseTrendChart = ({ data }) => (
    <div className="p-6 bg-white rounded-xl shadow-xl h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">New Case Notification Trend</h2>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" className="text-gray-700" />
                    <YAxis allowDecimals={false} className="text-gray-700" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="New Patients" fill={COLORS.trend} />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-80 text-gray-400">No trend data available.</div>
        )}
    </div>
);


// --- Main Dashboard Component ---

const DashboardMetrics = () => {
    const dispatch = useDispatch();
    const { dashboard, trends, loading, error } = useSelector((state) => state.reports);
    
    const [period, setPeriod] = useState('month'); 

    useEffect(() => {
        dispatch(fetchDashboardData());
        dispatch(fetchTrends({ period })); 
    }, [dispatch, period]);
    
    const outcomeData = useMemo(() => prepareOutcomeData(dashboard?.treatments), [dashboard]);
    const trendData = useMemo(() => prepareTrendData(trends), [trends]);
          
    if (loading === 'pending') return <LoadingSpinner message="Loading Dashboard Metrics..." />;
    
    if (error) return <Alert variant='danger' className="mt-4">{error}</Alert>;
    
    if (!dashboard) return <Alert variant='info' className="mt-4">No dashboard data available.</Alert>;


    return (
        <div className="p-4 bg-gray-50 min-h-screen"> 
            
            {/* --- Standard Back Navigation --- */}
            <div className="mb-4">
                <Link 
                    to="/reports" 
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition duration-150"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Reports Hub
                </Link>
            </div>
            
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Operational Health Dashboard</h1>
            
            {/* --- 1. KEY PERFORMANCE INDICATORS (KPIs) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard 
                    title="Total Patients Registered" 
                    value={dashboard.patients.totalPatients || 0} 
                    color="bg-blue-600"
                />
                <KPICard 
                    title="Active Treatment Cases" 
                    value={dashboard.patients.activePatients || 0} 
                    color="bg-emerald-500"
                    isHighlight={true}
                />
                <KPICard 
                    title="Positive GeneXpert Results" 
                    value={dashboard.labTests.positiveGeneXpert || 0} 
                    color="bg-amber-500"
                />
                <KPICard 
                    title="Total Treatments Handled" 
                    value={dashboard.treatments.totalTreatments || 0} 
                    color="bg-indigo-600"
                />
            </div>

            {/* --- 2. TRENDS AND DISTRIBUTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-xl">
                    <div className="d-flex justify-content-end align-items-center p-4">
                        <Form.Group controlId="periodSelect" className="m-0">
                            <Form.Select 
                                value={period} 
                                onChange={(e) => setPeriod(e.target.value)}
                                size="sm"
                            >
                                <option value="month">Monthly Trend</option>
                                <option value="week">Weekly Trend</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <NewCaseTrendChart data={trendData} />
                </div>
                
                {/* Treatment Outcome Pie Chart */}
                <OutcomeDistributionChart data={outcomeData} />
            </div>

            {/* --- 3. LAB & CRITICAL SUMMARIES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Lab Summary Card */}
                <div className="p-6 bg-white rounded-xl shadow-xl">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Lab Test Summary</h3>
                    <ul className="divide-y divide-gray-200">
                        <li className="list-group-item d-flex justify-content-between py-3">
                            Total Lab Tests Done: <span className="font-semibold text-gray-900">{dashboard.labTests.totalTests || 0}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between py-3">
                            Completed Tests: <span className="font-semibold text-gray-900">{dashboard.labTests.completedTests || 0}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between py-3 text-red-600 font-bold">
                            Positive GeneXpert: <span className="font-extrabold text-red-600">{dashboard.labTests.positiveGeneXpert || 0}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between py-3 text-red-600">
                            Positive Smear: <span className="font-semibold text-red-600">{dashboard.labTests.positiveSmear || 0}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between py-3 text-green-600">
                            Negative Results: <span className="font-semibold text-green-600">{(dashboard.labTests.totalTests - dashboard.labTests.positiveGeneXpert - dashboard.labTests.positiveSmear) || 0}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardMetrics;