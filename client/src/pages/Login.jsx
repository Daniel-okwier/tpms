import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/slices/authSlice";
import api from "../utils/axios";
import logo from "../assets/Logoportal.png";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [credentials, setCredentialsState] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setCredentialsState({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("auth/login", credentials);

      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-800 flex items-center justify-center">
        <p className="text-white text-lg font-semibold">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Facility Logo" className="h-14" />
        </div>
        <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
          TPMS Login
        </h1>

        {error && (
          <p className="text-red-600 text-center mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg p-3 transition-colors flex items-center justify-center"
          >
            {submitting ? (
              <span className="loader border-white border-2 border-t-transparent rounded-full w-5 h-5 mr-2 animate-spin"></span>
            ) : null}
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot password link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-blue-700 hover:underline text-sm"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
}
