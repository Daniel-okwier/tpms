import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/slices/authSlice";
import api from "../utils/axios";
import logo from "../assets/Logoportal.png";
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  // 1. SERVER WAKE-UP: Pings the backend immediately to reduce Render cold-start delay
  useEffect(() => {
    api.get("/auth/status").catch(() => {});
  }, []);

  const handleChange = (e) => {
    setCredentialsState({ ...credentials, [e.target.name]: e.target.value });
  };

  // 2. GUEST ACCESS: Auto-fills and logs in as a Clinical/Super user for recruiters
  const handleGuestLogin = () => {
    const guestCreds = {
      email: "admin@example.com", 
      password: "Admin123!",
    };
    setCredentialsState(guestCreds);
    // Submit the form shortly after filling
    setTimeout(() => {
      const form = document.getElementById("login-form");
      if (form) form.requestSubmit();
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", credentials);

      if (data?.user && data?.token) {
        dispatch(setCredentials({ user: data.user, token: data.token }));
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      if (!err.response) {
        setError("Connecting to server... (Waking up Render backend)");
      } else {
        setError(err.response?.data?.message || "Invalid email or password");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-800 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-black uppercase tracking-widest text-sm">System Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-800 flex flex-col items-center justify-center p-4">
      {/* Container: Tightened padding and max-height logic */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-7 w-full max-w-[400px] border border-white/20">
        
        {/* Logo & Header - Compacted */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="h-10 mb-3 object-contain" />
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            TPMS Portal
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Clinical Registry
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-3 mb-5 rounded-2xl flex items-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} />
            <p className="text-[10px] font-black uppercase tracking-tight leading-none">{error}</p>
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Institutional Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@demo.com"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm text-slate-900 font-bold placeholder:text-slate-300"
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <button 
                type="button" 
                onClick={() => navigate("/forgot-password")}
                className="text-[9px] font-bold text-blue-600 hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm text-slate-900 font-bold tracking-[0.3em] placeholder:text-slate-300 placeholder:tracking-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black uppercase tracking-widest rounded-2xl p-4 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
          >
            {submitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Enter System"}
          </button>
        </form>

        {/* Guest Access Section - Clean and Professional */}
        <div className="mt-6 pt-5 border-t border-slate-50 flex flex-col items-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">
            Recruiter Quick Access
          </p>
          <button
            type="button"
            onClick={handleGuestLogin}
            className="group flex items-center gap-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-6 py-2.5 rounded-xl border border-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <Zap size={12} className="group-hover:fill-current fill-emerald-700" />
            Login as Guest
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 opacity-40">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
        <p className="text-blue-100 text-[9px] font-black uppercase tracking-[0.3em]">
          System Secure & Operational
        </p>
      </div>
    </div>
  );
}