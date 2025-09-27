// client/src/pages/ScreeningsDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchScreenings, deleteScreening } from "../redux/slices/screeningSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import ScreeningForm from "./ScreeningForm";
import ScreeningDetailsPage from "./ScreeningDetailsPage";
import { toast } from "react-toastify";

const ScreeningsDashboard = () => {
 const dispatch = useDispatch();

  // Screenings state const { items: screenings = [], loading, error } = useSelector( // FIX APPLIED HERE: Added = [] fallback
 (state) => state.screening );

  // Patients
 const patients = useSelector((state) => state.patients.items || []);

  // UI state
 const [showForm, setShowForm] = useState(false);
 const [showDetail, setShowDetail] = useState(false);
 const [selectedScreening, setSelectedScreening] = useState(null);

  // Search/filter
 const [filters, setFilters] = useState({ q: "" });

 useEffect(() => {
 dispatch(fetchScreenings());
 dispatch(fetchPatients({ page: 1, limit: 100 }));
 }, [dispatch]);

 const handleDelete = async (id) => {
if (!window.confirm("Are you sure you want to delete this screening?")) return;

 try {
 await dispatch(deleteScreening(id)).unwrap();
 toast.success("Screening deleted successfully");
dispatch(fetchScreenings());
 } catch (err) {
toast.error(err.message || "Failed to delete screening");
 }
 };

 const handleEdit = (screening) => {
 setSelectedScreening(screening);
 setShowForm(true);
};

  // Filtered screenings
 const filteredScreenings = screenings.filter((s) => {   const q = filters.q.toLowerCase();
 return (
!filters.q ||
 s.patient?.firstName?.toLowerCase().includes(q) ||
 s.patient?.lastName?.toLowerCase().includes(q) ||
s.patient?.mrn?.includes(filters.q) ||
 s.patientId?.toLowerCase().includes(q)
);
});

return (
 <div className="p-4">
{/* Title + New button */}
 <div className="flex justify-between items-center mb-4">
 <h1 className="text-2xl font-bold text-white">Screenings</h1>
 <button
 onClick={() => {
 setSelectedScreening(null);
 setShowForm(true);
}}
 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
 >
 New Screening
 </button>
 </div>

 {/* Search bar */}
 <div className="flex gap-2 mb-4 flex-wrap">
 <input
    type="text"
 placeholder="Search by patient name, MRN, or ID"
 value={filters.q}
 onChange={(e) => setFilters({ ...filters, q: e.target.value })}
 className="border px-2 py-1 rounded text-black"
 />
</div>
 {/* Table */}
<div className="overflow-x-auto">
 <table className="w-full table-auto border border-gray-300 bg-white text-black rounded-lg shadow-md">
 <thead>
 <tr className="bg-gray-100 text-gray-700">
<th className="border px-2 py-2 text-left">Patient</th>
 <th className="border px-2 py-2 text-left">MRN</th>
 <th className="border px-2 py-2 text-left">Screening Date</th>
  <th className="border px-2 py-2 text-left">Type</th>
 <th className="border px-2 py-2 text-left">Result</th>
 <th className="border px-2 py-2 text-center">Actions</th>
 </tr>
</thead>
 <tbody>
 {loading === "pending" && (
 <tr>
<td colSpan="6" className="text-center py-4">
 Loading screenings...
 </td>
 </tr>
 )}

 {error && (
 <tr>
 <td colSpan="6" className="text-center text-red-500 py-4">
 {typeof error === "string" ? error : "Failed to load screenings"}
 </td>
 </tr>
 )}

 {loading === "succeeded" &&
 !error &&
 filteredScreenings.map((s) => (
<tr key={s._id} className="border-b hover:bg-gray-50">
 <td className="px-4 py-2">
 {s.patient
 ? `${s.patient.firstName} ${s.patient.lastName}`
 : s.patientId || "N/A"}
 </td>
 <td className="px-4 py-2">{s.patient?.mrn || "N/A"}</td>
<td className="px-4 py-2">
 {new Date(s.screeningDate).toLocaleDateString()}
 </td>
 <td className="px-4 py-2">{s.type || "N/A"}</td>
 <td className="px-4 py-2">{s.result || "Pending"}</td>
 <td className="px-4 py-2 flex gap-2 justify-center">
 <button
 onClick={() => handleEdit(s)}
 className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 shadow"
 >
Edit
 </button>
 <button
 onClick={() => handleDelete(s._id)}
 className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 shadow"
 >
 Delete
 </button>
 <button
 onClick={() => {
 setSelectedScreening(s);
 setShowDetail(true);
 }}
 className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 shadow"
 >
 Details
</button>
 </td>
 </tr>
 ))}

 {loading === "succeeded" &&
 !error &&
 filteredScreenings.length === 0 && (
 <tr>
 <td colSpan="6" className="text-center py-4">
 No screenings found
 </td>
 </tr>
 )}
 </tbody>
 </table>
  </div>

{/* Modals */}
{showForm && (
 <ScreeningForm
 existingScreening={selectedScreening}
 patients={patients}
 onClose={() => setShowForm(false)}
 />
 )}

{showDetail && (
 <ScreeningDetail
 screening={selectedScreening}
 onClose={() => setShowDetail(false)}
 />
 )}
 </div>
 );
};

export default ScreeningsDashboard;