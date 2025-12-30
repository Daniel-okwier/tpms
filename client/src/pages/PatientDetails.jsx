import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { 
  ArrowLeft, Edit3, User, MapPin, 
  Phone, Mail, Calendar, Building2, 
  Activity, ClipboardList 
} from "lucide-react";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data } = await api.get(`/patients/${id}`);
        setPatient(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load patient");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
        <Activity size={20} />
        {error}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Action Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(`/patients`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Registry
        </button>
        
        <button
          onClick={() => navigate(`/patients`)} // In your setup, editing is handled on the main page
          className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          <Edit3 size={18} />
          Edit Record
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-8 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-inner">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 capitalize">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  patient.initialStatus === 'confirmed_tb' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {patient.initialStatus?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-blue-600 font-mono font-bold tracking-tighter">ID: {patient.mrn}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Section 1: Demographics */}
          <div className="p-8 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Demographics
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Gender</p>
                <p className="font-bold text-slate-700 capitalize">{patient.gender}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</p>
                <p className="font-bold text-slate-700">{new Date(patient.dateOfBirth).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Facility Info */}
          <div className="p-8 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={14} /> Clinical Site
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Facility Name</p>
                <p className="font-bold text-slate-700">{patient.facilityName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Registration Date</p>
                <p className="font-bold text-slate-700">{new Date(patient.createdAt || patient.registrationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Contact */}
          <div className="p-8 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} /> Communication
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Phone size={14}/></div>
                <p className="font-bold text-slate-700">{patient.contactInfo?.phone || "No Phone Provided"}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Mail size={14}/></div>
                <p className="font-bold text-slate-700">{patient.contactInfo?.email || "No Email Provided"}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPin size={14}/></div>
                <p className="font-bold text-slate-700">{patient.address || "No Address Provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Timeline Placeholder */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> Clinical Records Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-10">
            <Activity className="text-slate-300 mb-2" />
            <p className="text-slate-400 font-medium italic">No Lab results yet</p>
          </div>
          <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-10">
            <Calendar className="text-slate-300 mb-2" />
            <p className="text-slate-400 font-medium italic">No Upcoming appointments</p>
          </div>
        </div>
      </div>
    </div>
  );
}