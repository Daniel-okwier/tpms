import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function PatientForm({ isOpen, onClose, onSubmit, editingPatient }) {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", gender: "male", dateOfBirth: "",
    contactInfo: { phone: "", email: "" },
    address: "", facilityName: "", initialStatus: "suspected_tb"
  });

  // Sync form data when editingPatient changes
  useEffect(() => {
    if (editingPatient) {
      setFormData({
        firstName: editingPatient.firstName || "",
        lastName: editingPatient.lastName || "",
        gender: editingPatient.gender || "male",
        dateOfBirth: editingPatient.dateOfBirth ? new Date(editingPatient.dateOfBirth).toISOString().split('T')[0] : "",
        contactInfo: { 
          phone: editingPatient.contactInfo?.phone || "", 
          email: editingPatient.contactInfo?.email || "" 
        },
        address: editingPatient.address || "",
        facilityName: editingPatient.facilityName || "",
        initialStatus: editingPatient.initialStatus || "suspected_tb"
      });
    } else {
      setFormData({
        firstName: "", lastName: "", gender: "male", dateOfBirth: "",
        contactInfo: { phone: "", email: "" },
        address: "", facilityName: "", initialStatus: "suspected_tb"
      });
    }
  }, [editingPatient, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
            {editingPatient ? "Edit Clinical Record" : "Add Patient Record"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => onSubmit(e, formData)} className="p-8 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">First Name</label>
              <input required className="w-full px-4 py-2 border rounded-xl outline-none" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Last Name</label>
              <input required className="w-full px-4 py-2 border rounded-xl outline-none" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
              <select className="w-full px-4 py-2 border rounded-xl outline-none" value={formData.gender} onChange={(e)=>setFormData({...formData, gender: e.target.value})}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">DOB</label>
              <input type="date" required className="w-full px-4 py-2 border rounded-xl outline-none" value={formData.dateOfBirth} onChange={(e)=>setFormData({...formData, dateOfBirth: e.target.value})}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
              <input required className="w-full px-4 py-2 border rounded-xl outline-none font-mono" value={formData.contactInfo.phone} onChange={(e)=>setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
              <input type="email" className="w-full px-4 py-2 border rounded-xl outline-none" value={formData.contactInfo.email} onChange={(e)=>setFormData({...formData, contactInfo: {...formData.contactInfo, email: e.target.value}})}/>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Facility Name</label>
            <input required className="w-full px-4 py-2 border rounded-xl outline-none font-bold" value={formData.facilityName} onChange={(e)=>setFormData({...formData, facilityName: e.target.value})}/>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Initial Status</label>
            <select className="w-full px-4 py-2 border rounded-xl outline-none" value={formData.initialStatus} onChange={(e)=>setFormData({...formData, initialStatus: e.target.value})}>
              <option value="suspected_tb">Suspected TB</option>
              <option value="confirmed_tb">Confirmed TB</option>
            </select>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2">
              <Save size={18}/> {editingPatient ? "Update Record" : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}