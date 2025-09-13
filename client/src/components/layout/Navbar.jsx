import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCredentials } from "../../redux/slices/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    // Clear auth state
    dispatch(setCredentials(null));

    // Remove from localStorage (if stored there)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login
    navigate("/login");
  };

  return (
    <nav className="bg-blue-800 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="text-lg font-bold">
        <Link to="/dashboard">TPMS</Link>
      </div>

      <div className="space-x-6 hidden md:flex">
        {user?.role === "admin" && (
          <Link to="/manage-users" className="hover:underline">
            Manage Users
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm font-medium">
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
