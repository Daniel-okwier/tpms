import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Calendar, User, Hash, Loader2 } from "lucide-react";
import api from "../../utils/axios";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        // Ensure this matches your backend route exactly!
        const { data } = await api.get(`/auth/users/${id}`); 
        setUser(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserDetail();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  );

  if (!user) return (
    <div className="p-20 text-center">
      <h2 className="text-xl font-bold text-slate-800">User Not Found</h2>
      <p className="text-slate-500 mb-4">The user ID might be incorrect or deleted.</p>
      <button onClick={() => navigate('/manage-users')} className="text-blue-600 font-bold underline">Back to Users</button>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
         <ArrowLeft size={18}/> Back
       </button>
       
       <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
             <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <User size={40} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
                <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mt-1">{user.role}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Email Address</p>
                <p className="font-bold text-slate-700 flex items-center gap-2"><Mail size={14}/> {user.email}</p>
             </div>
             <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
    <p className="font-bold text-slate-700 flex items-center gap-2">
      <Calendar size={14} className="text-slate-400"/> 
      {new Date(user.createdAt).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })}
    </p>
  </div>
          </div>
       </div>
    </div>
  );
}