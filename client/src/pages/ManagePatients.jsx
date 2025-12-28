import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, UserRoundPen, Archive, Eye, 
  CheckCircle, AlertCircle, Building2, Users, Activity, Clock
} from "lucide-react"; 
import { fetchPatients, archivePatient, updatePatient, createPatient } from "@/redux/slices/patientSlice";
import PatientForm from "./PatientForm";

export default function Patients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [], loading } = useSelector((state) => state.patients);
  
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // --- 🔍 CLIENT-SIDE FILTERING LOGIC (Same as your DiagnosisPage) ---
  const filteredPatients = items.filter((p) => {
    const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
    const mrn = p.mrn?.toLowerCase() || "";
    const facility = p.facilityName?.toLowerCase() || "";
    const query = searchTerm.toLowerCase();

    return fullName.includes(query) || mrn.includes(query) || facility.includes(query);
  });

  const stats = {
    total: items.length,
    suspected: items.filter(p => p.initialStatus === 'suspected_tb').length,
    confirmed: items.filter(p => p.initialStatus === 'confirmed_tb').length
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await dispatch(updatePatient({ id: editingPatient._id, ...formData })).unwrap();
        showToast("Record updated successfully");
      } else {
        await dispatch(createPatient(formData)).unwrap();
        showToast("Patient registered successfully");
      }
      setShowForm(false);
      dispatch(fetchPatients()); 
    } catch (err) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto relative min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[120] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <p className="font-bold">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Patient Information System</h1>
          <p className="text-slate-500 text-sm font-medium">Registry Management Overview</p>
        </div>
        <button 
          onClick={() => { setEditingPatient(null); setShowForm(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Plus size={20} /> <span>Add Patient</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold"><Users size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered</p><p className="text-3xl font-black text-slate-900">{stats.total}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold"><Clock size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspected</p><p className="text-3xl font-black text-slate-900">{stats.suspected}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold"><Activity size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed</p><p className="text-3xl font-black text-slate-900">{stats.confirmed}</p></div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex max-w-md bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-blue-50 overflow-hidden">
        <div className="pl-4 flex items-center text-slate-400">
          <Search size={20} />
        </div>
        <input 
          placeholder="Search Name, MRN, or Facility..."
          className="flex-1 pl-3 py-2.5 outline-none text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table & Results */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {filteredPatients.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Facility</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right px-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 capitalize">{p.firstName} {p.lastName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{p.mrn}</span>
                      <span className="text-[11px] text-slate-400 font-medium capitalize">{p.gender} • {p.age || 0} yrs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600 text-sm">
                    <div className="flex items-center gap-2"><Building2 size={14} className="text-slate-300"/>{p.facilityName}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      p.initialStatus === 'confirmed_tb' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {p.initialStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 px-4">
                      <button onClick={() => navigate(`/patients/${p._id}`)} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white flex items-center gap-1.5 transition-all"><Eye size={14}/>View</button>
                      <button onClick={() => { setEditingPatient(p); setShowForm(true); }} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-white flex items-center gap-1.5 transition-all"><UserRoundPen size={14}/>Edit</button>
                      <button onClick={() => { if(window.confirm('Archive patient?')) dispatch(archivePatient(p._id)).then(() => dispatch(fetchPatients())) }} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white flex items-center gap-1.5 transition-all"><Archive size={14}/>Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Empty State when filteredPatients has 0 results */
          <div className="py-24 text-center flex flex-col items-center justify-center">
             <div className="bg-slate-50 p-6 rounded-full mb-4 text-slate-200"><Search size={48}/></div>
             <p className="text-slate-500 text-lg font-bold">Patient Not Found</p>
             <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto text-center">
               We couldn't find any records matching <span className="text-blue-600 font-bold">"{searchTerm}"</span>.
             </p>
          </div>
        )}
      </div>

      <PatientForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        onSubmit={handleSubmit}
        editingPatient={editingPatient}
      />
    </div>
  );
}