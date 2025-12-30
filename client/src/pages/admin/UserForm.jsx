import React, { useState, useEffect } from "react";
import { X, Save, Shield } from "lucide-react";
import api from "../../utils/axios";

export default function UserForm({ isOpen, onClose, refreshUsers, editingUser, showToast }) {
  const [formData, setFormData] = useState({ name: "", email: "", role: "doctor" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({ name: editingUser.name, email: editingUser.email, role: editingUser.role });
    } else {
      setFormData({ name: "", email: "", role: "doctor" });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        await api.put(`/auth/users/${editingUser._id}`, formData);
        showToast("Access updated successfully");
      } else {
        await api.post("/auth/create-user", formData);
        showToast("New user account created");
      }
      onClose();
      refreshUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Shield size={16} className="text-blue-600"/>
            {editingUser ? "Edit User Account" : "Create Staff Account"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input 
              required 
              className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium" 
              value={formData.name} 
              onChange={(e)=>setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Dr. John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required 
              disabled={!!editingUser}
              className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 transition-all" 
              value={formData.email} 
              onChange={(e)=>setFormData({...formData, email: e.target.value})}
              placeholder="staff@hospital.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Role</label>
            <select 
              className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-slate-700" 
              value={formData.role} 
              onChange={(e)=>setFormData({...formData, role: e.target.value})}
            >
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="lab_staff">Lab Staff</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
              {editingUser ? "Update Permissions" : "Provision Account"}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}