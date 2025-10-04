import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiagnoses, deleteDiagnosis } from "@/redux/slices/diagnosisSlice";
import DiagnosisForm from "./DiagnosisForm";
import DiagnosisDetails from "./DiagnosisDetails";

const DiagnosisList = () => {
  const dispatch = useDispatch();
  const { diagnoses, loading, error } = useSelector((state) => state.diagnosis);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchDiagnoses());
  }, [dispatch]);

  const filteredDiagnoses = diagnoses.filter((d) => {
    const name = `${d.patient?.firstName ?? ""} ${d.patient?.lastName ?? ""}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      d.patient?.mrn?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Diagnoses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Diagnosis
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or MRN..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 mb-4 w-full rounded"
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Patient</th>
            <th className="p-2 border">Diagnosis Type</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Doctor</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDiagnoses.map((d) => (
            <tr key={d._id} className="hover:bg-gray-100">
              <td className="p-2 border">
                {d.patient?.firstName} {d.patient?.lastName} (MRN: {d.patient?.mrn})
              </td>
              <td className="p-2 border">{d.diagnosisType}</td>
              <td className="p-2 border">
                {new Date(d.diagnosisDate).toLocaleDateString()}
              </td>
              <td className="p-2 border">{d.diagnosedBy?.name}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => setShowDetails(d)}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  View
                </button>
                <button
                  onClick={() => dispatch(deleteDiagnosis(d._id))}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredDiagnoses.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No diagnoses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showForm && <DiagnosisForm onClose={() => setShowForm(false)} />}
      {showDetails && (
        <DiagnosisDetails diagnosis={showDetails} onClose={() => setShowDetails(null)} />
      )}
    </div>
  );
};

export default DiagnosisList;
