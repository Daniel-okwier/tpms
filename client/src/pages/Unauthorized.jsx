// src/pages/Unauthorized.jsx
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="mb-6">You do not have permission to access this page.</p>
      <Link
        to="/dashboard"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go Back to Dashboard
      </Link>
    </div>
  );
}
