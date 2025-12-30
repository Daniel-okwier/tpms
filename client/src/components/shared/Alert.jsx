
import React from 'react';
import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const baseStyles = "p-4 rounded-lg flex items-start shadow-sm";

const variantStyles = {
    error: {
        bg: "bg-red-50 border border-red-200",
        text: "text-red-800",
        icon: <XCircle className="w-5 h-5 flex-shrink-0" />,
    },
    success: {
        bg: "bg-green-50 border border-green-200",
        text: "text-green-800",
        icon: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    },
    warning: {
        bg: "bg-yellow-50 border border-yellow-200",
        text: "text-yellow-800",
        icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    },
    info: {
        bg: "bg-blue-50 border border-blue-200",
        text: "text-blue-800",
        icon: <Info className="w-5 h-5 flex-shrink-0" />,
    },
};

const Alert = ({ message, type = 'error', className = '' }) => {
    const { bg, text, icon } = variantStyles[type] || variantStyles.info;

    return (
        <div 
            role="alert" 
            className={`${baseStyles} ${bg} ${text} ${className} my-4`}
        >
            <div className="mr-3">{icon}</div>
            <div className="text-sm font-medium flex-1">
                {message || 'An unexpected error occurred.'}
            </div>
        </div>
    );
};

export default Alert;