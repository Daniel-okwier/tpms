import React from 'react';
import { Link } from 'react-router-dom'; 

const ReportsCenterLanding = () => {
    
    // Defines the two primary navigation cards
    const navItems = [
        {
            title: "Operational Dashboard",
            description: "View real-time performance indicators, current case loads, and treatment outcomes.",
            path: "/reports/dashboard", 
            icon: '📊', 
            color: "bg-indigo-600",
            hover: "hover:bg-indigo-700"
        },
        {
            title: "Strategic Report Generator",
            description: "Generate and download formal PDF reports (e.g., Quarterly NTP Report) for public health submission.",
            path: "/reports/generator", 
            icon: '📄', 
            color: "bg-emerald-600",
            hover: "hover:bg-emerald-700"
        }
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            
            {/* --- REPORTS CENTER HEADER TEXT --- */}
            <div className="mb-10 p-6 bg-white rounded-xl shadow-lg border-l-4 border-indigo-600">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    Reports & Analytics Center
                </h1>
                <p className="text-lg text-gray-700 mt-2">
                    Access real-time metrics and formal surveillance documentation for the National TB Program.
                </p>
            </div>

            {/* --- ACTION BUTTONS (CARDS) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {navItems.map((item) => (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`block p-6 rounded-xl shadow-2xl transform transition duration-300 ${item.hover} ${item.color} text-white group`}
                    >
                        <div className="flex items-start">
                            {/* Text Icon */}
                            <span className="text-4xl mr-4 p-2 bg-white bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-colors font-bold">
                                {item.icon}
                            </span>
                            
                            {/* Text Content */}
                            <div>
                                <h2 className="text-2xl font-bold mb-1 border-b border-white border-opacity-30 pb-1">
                                    {item.title}
                                </h2>
                                <p className="text-base font-light opacity-90">
                                    {item.description}
                                </p>
                                <span className="mt-3 inline-block text-sm font-semibold border-b border-white border-opacity-0 group-hover:border-opacity-100 transition-all duration-300">
                                    Go to tool →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ReportsCenterLanding;