import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiagnoses, deleteDiagnosis } from "../redux/slices/diagnosisSlice";
import DiagnosisForm from "./DiagnosisForm";
import DiagnosisDetails from "./DiagnosisDetails";
import { 
  Search, Plus, Activity, ClipboardList, 
  Stethoscope, Eye, PencilLine, Trash2, Loader2,
  Calendar, CheckCircle, AlertCircle
} from "lucide-react";

const DiagnosisPage = () => {
  const dispatch = useDispatch();
  const { diagnoses = [], loading } = useSelector((state) => state.diagnosis || {});

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  
  // Custom Toast State matching Patients dashboard exactly
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    dispatch(fetchDiagnoses());
  }, [dispatch]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this diagnosis record?")) return;
    try {
      await dispatch(deleteDiagnosis(id)).unwrap();
      showToast("Record removed successfully");
      dispatch(fetchDiagnoses());
    } catch (err) {
      showToast(err?.message || "Delete failed", "error");
    }
  };

  const filteredDiagnoses = diagnoses.filter((d) => {
    const name = `${d.patient?.firstName || ""} ${d.patient?.lastName || ""}`.toLowerCase();
    const mrn = d.patient?.mrn?.toLowerCase() || "";
    const diag = d.diagnosisType?.toLowerCase() || "";
    const query = search.toLowerCase();
    return name.includes(query) || mrn.includes(query) || diag.includes(query);
  });

  const stats = {
    total: diagnoses.length,
    positive: diagnoses.filter(d => d.diagnosisType?.toLowerCase().includes('pulmonary')).length,
    recent: diagnoses.filter(d => {
        const dDate = new Date(d.diagnosisDate);
        const today = new Date();
        return dDate.getMonth() === today.getMonth() && dDate.getFullYear() === today.getFullYear();
    }).length
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen relative">
      {/* Toast UI - Exact match to Patients file */}
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
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Clinical Registry</h1>
          <p className="text-slate-500 text-sm font-medium">Diagnosis & Screening Management</p>
        </div>
        <button 
          onClick={() => { setSelected(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Plus size={20} /> <span>New Diagnosis</span>
        </button>
      </div>

      {/* Stats Cards - Matches layout and font weights of Patients file */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold"><ClipboardList size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Records</p><p className="text-3xl font-black text-slate-900">{stats.total}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold"><Activity size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Positive Cases</p><p className="text-3xl font-black text-slate-900">{stats.positive}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold"><Stethoscope size={28} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month</p><p className="text-3xl font-black text-slate-900">{stats.recent}</p></div>
        </div>
      </div>

      {/* Search Input - Matches blue-50 focus ring of Patients file */}
      <div className="flex max-w-md bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-blue-50 overflow-hidden">
        <div className="pl-4 flex items-center text-slate-400"><Search size={20} /></div>
        <input 
          placeholder="Search patient, MRN or diagnosis..."
          className="flex-1 pl-3 py-2.5 outline-none text-slate-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main Content Area Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Synchronizing Clinical Data...</p>
          </div>
        ) : filteredDiagnoses.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Diagnosis Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clinical Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right px-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiagnoses.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 capitalize">
                      {d.patient ? `${d.patient.firstName} ${d.patient.lastName}` : "N/A"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                        {d.patient?.mrn || "NO-MRN"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      d.diagnosisType?.includes('No') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {d.diagnosisType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(d.diagnosisDate).toLocaleDateString('en-GB')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 px-4">
                      <button onClick={() => { setSelected(d); setShowDetail(true); }} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white flex items-center gap-1.5 transition-all"><Eye size={14}/>View</button>
                      <button onClick={() => { setSelected(d); setShowForm(true); }} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white flex items-center gap-1.5 transition-all"><PencilLine size={14}/>Edit</button>
                      <button onClick={() => handleDelete(d._id)} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white flex items-center gap-1.5 transition-all"><Trash2 size={14}/>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex-1 py-24 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4 text-slate-200"><Search size={48}/></div>
            <p className="text-slate-500 text-lg font-bold">No Records Found</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
              {search ? `No results for "${search}"` : "The clinical registry is currently empty."}
            </p>
          </div>
        )}
      </div>

      {showForm && <DiagnosisForm onClose={() => { setShowForm(false); dispatch(fetchDiagnoses()); }} existing={selected} />}
      {showDetail && selected && <DiagnosisDetails diagnosis={selected} onClose={() => setShowDetail(false)} />}
    </div>
  );
};

export default DiagnosisPage;