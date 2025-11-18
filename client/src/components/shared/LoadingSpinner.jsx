import React from "react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}
