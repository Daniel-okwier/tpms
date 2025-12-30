import React from "react";
import Spinner from "./LoadingSpinner"; 

const Button = ({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    className = "",
    loading = false, 
    icon,           
    ...props         
}) => {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
        success: "bg-green-600 text-white hover:bg-green-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
        info: "bg-indigo-600 text-white hover:bg-indigo-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
    };
    
    const isLoading = !!loading;

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
            disabled={props.disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Spinner className="w-4 h-4 text-white" /> 
            ) : (
                <>
                    {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;