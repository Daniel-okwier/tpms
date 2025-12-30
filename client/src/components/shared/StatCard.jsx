// File: src/components/shared/StatCard.jsx

import React from 'react';

const StatCard = ({ title, value, icon, detail, color = 'indigo' }) => {
    // Determine color classes
    const iconBg = `bg-${color}-100`;
    const iconText = `text-${color}-500`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between border border-gray-100">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
            </div>
            <div className={`p-3 rounded-full ${iconBg}`}>
                {React.cloneElement(icon, { className: `w-8 h-8 ${iconText}` })}
            </div>
        </div>
    );
};

export default StatCard;