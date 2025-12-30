import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiagnosis, updateDiagnosis } from "../redux/slices/diagnosisSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import { fetchLabTestsByPatient, labTestsSelectors } from "../redux/slices/labTestsSlice";
import { 
  X, User, ClipboardList, Beaker, FileText, 
  ChevronRight, CheckCircle2, AlertCircle, CheckCircle
} from "lucide-react";

const DiagnosisForm = ({ onClose, existing }) => {
  const dispatch = useDispatch();

  // Data Selectors
  const patients = useSelector((state) => state.patients?.items || []);
  const labResults = useSelector(labTestsSelectors.selectAll);
  const labLoading = useSelector((state) => state.labTests?.loading === "pending");

  // Matching Toast State from Patient module
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    patient: existing?.patient?._id || "",
    diagnosisType: existing?.diagnosisType || "",
    notes: existing?.notes || "",
    labTests: existing?.labTests?.map(lt => lt._id || lt) || [],
  });

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (formData.patient) {
      dispatch(fetchLabTestsByPatient(formData.patient));
    }
  }, [formData.patient, dispatch]);

  useEffect(() => {
    if (labResults.length > 0 && !existing) {
      const ids = labResults.map(lr => lr._id);
      setFormData(prev => ({ ...prev, labTests: ids }));
    }
  }, [labResults, existing]);

  // Toast helper matching the dashboard logic
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
      if (type === "success") onClose(); // Close only on success
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient || !formData.diagnosisType) {
      showToast("Please select a patient and diagnosis type", "error");
      return;
    }

    try {
      const payload = {
        patient: formData.patient,
        diagnosisType: formData.diagnosisType,
        notes: formData.notes,
        labTests: formData.labTests
      };

      if (existing) {
        await dispatch(updateDiagnosis({ id: existing._id, updates: payload })).unwrap();
        showToast("Clinical record updated successfully");
      } else {
        await dispatch(createDiagnosis(payload)).unwrap();
        showToast("Diagnosis recorded successfully");
      }
    } catch (err) {
      showToast(err?.message || "Operation failed", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
      {/* Internal Toast - Z-index higher than modal */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[140] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <p className="font-bold">{toast.message}</p>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        
        {/* Header - Consistent with PatientForm */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <ClipboardList className="text-blue-600" size={24} />
              {existing ? "Edit Record" : "New Diagnosis"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Verify lab history before confirming conclusion</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={12}/> Select Patient
            </label>
            <select
              name="patient"
              value={formData.patient}
              onChange={(e) => setFormData({...formData, patient: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer"
              disabled={!!existing}
              required
            >
              <option value="">Search for patient...</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.firstName} {p.lastName} (MRN: {p.mrn})</option>
              ))}
            </select>
          </div>

          {/* Lab Evidence Section - Highlighting the "Refined" UI */}
          {formData.patient && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <Beaker size={14}/> Evidence (Last Lab Tests)
                </h3>
                {labLoading && <div className="text-[10px] font-bold text-blue-400 animate-pulse uppercase">Syncing...</div>}
              </div>
              
              <div className="space-y-2">
                {labResults.length > 0 ? (
                  labResults.slice(0, 3).map((lr) => (
                    <div key={lr._id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><FileText size={14}/></div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{lr.testType}</p>
                          <p className="text-[10px] text-slate-400 font-black italic uppercase tracking-tighter">{lr.result}</p>
                        </div>
                      </div>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs font-medium italic">No recent lab tests found for this patient.</div>
                )}
              </div>
            </div>
          )}

          {/* Diagnosis Type Selection - The "Toggle" Style */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Conclusion</label>
            <div className="grid grid-cols-2 gap-3">
              {['Pulmonary TB', 'Extra-pulmonary TB', 'No TB', 'Suspected TB'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, diagnosisType: type})}
                  className={`p-4 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-between group ${
                    formData.diagnosisType === type 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {type}
                  {formData.diagnosisType === type && <CheckCircle2 size={14} className="animate-in zoom-in" />}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Observation Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Observation</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm text-slate-700 h-28 outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none font-medium"
              placeholder="Enter specific notes or clinical findings..."
            />
          </div>

          {/* Submit Action */}
          <button
  type="submit"
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
>
  {existing ? "Save Clinical Update" : "Finalize Diagnosis"} <ChevronRight size={18}/>
</button>
        </form>
      </div>
    </div>
  );
};

export default DiagnosisForm;