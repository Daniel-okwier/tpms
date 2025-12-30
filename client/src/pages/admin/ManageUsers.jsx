import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { 
  UserPlus, Mail, Trash2, PencilLine, Search, 
  Loader2, ShieldCheck, UserCog, Users, Eye,
  CheckCircle, AlertCircle, Shield 
} from "lucide-react";
import UserForm from "./UserForm";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/users");
      setUsers(data);
    } catch (err) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user account permanently?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      showToast("User deleted successfully");
      fetchUsers();
    } catch (err) {
      showToast("Delete operation failed", "error");
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  // REAL DATA STATS
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    clinical: users.filter(u => u.role !== 'admin').length
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto relative min-h-screen">
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">System Access</h1>
          <p className="text-slate-500 text-sm font-medium">Manage Personnel & Roles</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <UserPlus size={20} /> <span>Create User</span>
        </button>
      </div>

      {/* Stats Cards - Updated to use Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center font-bold"><Users size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p><p className="text-3xl font-black text-slate-900">{stats.total}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold"><Shield size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admins</p><p className="text-3xl font-black text-slate-900">{stats.admins}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold"><UserCog size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Staff</p><p className="text-3xl font-black text-slate-900">{stats.clinical}</p></div>
        </div>
      </div>

      <div className="flex max-w-md bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-slate-100 overflow-hidden">
        <div className="pl-4 flex items-center text-slate-400"><Search size={20} /></div>
        <input 
          placeholder="Search by name, email or role..."
          className="flex-1 pl-3 py-2.5 outline-none text-slate-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium text-xs tracking-widest uppercase">Fetching Users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">User Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right px-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail size={12}/> {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 px-4">
                      <button 
                        onClick={() => navigate(`/users/${user._id}`)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye size={16}/>
                      </button>
                      <button 
                        onClick={() => { setEditingUser(user); setShowForm(true); }}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                        title="Edit User"
                      >
                        <PencilLine size={16}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-24 text-center">
             <p className="text-slate-500 font-bold">No Users Found</p>
          </div>
        )}
      </div>

      <UserForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        refreshUsers={fetchUsers}
        editingUser={editingUser}
        showToast={showToast}
      />
    </div>
  );
}