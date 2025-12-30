import React from "react";
import { X, User, Shield, Calendar, StickyNote, FileText, Activity } from "lucide-react";

const DiagnosisDetails = ({ diagnosis, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" /> Diagnosis Summary
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Profile Card Header (Matching PatientDetails style) */}
        <div className="p-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-inner capitalize">
              {diagnosis.patient?.firstName?.[0]}{diagnosis.patient?.lastName?.[0]}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 capitalize">
                {diagnosis.patient?.firstName} {diagnosis.patient?.lastName}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-blue-600 font-mono font-bold text-xs tracking-tight">ID: {diagnosis.patient?.mrn}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  diagnosis.diagnosisType?.includes('No') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {diagnosis.diagnosisType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid - Uses the exact Demographics/Facility layout style */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-8 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Clinical Timeline
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Diagnosis Date</p>
                <p className="font-bold text-slate-700">{new Date(diagnosis.diagnosisDate).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Attending Clinician</p>
                <p className="font-bold text-slate-700 flex items-center gap-1.5"><Shield size={14} className="text-blue-500"/> {diagnosis.diagnosedBy?.name || "System Record"}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Record Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Status</p>
                <p className="font-bold text-slate-700 capitalize">Confirmed Entry</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Last Updated</p>
                <p className="font-bold text-slate-700">{new Date(diagnosis.updatedAt || diagnosis.diagnosisDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notes section with the same styling as the registry empty state */}
        {diagnosis.notes && (
          <div className="p-8 pt-0">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <StickyNote size={14} className="text-blue-600"/> Clinical Observation
               </p>
               <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                 "{diagnosis.notes}"
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisDetails;