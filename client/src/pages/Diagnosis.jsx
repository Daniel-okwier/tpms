import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiagnoses, deleteDiagnosis } from "../redux/slices/diagnosisSlice";
import DiagnosisForm from "./DiagnosisForm";
import DiagnosisDetail from "./DiagnosisDetails";
import { toast } from "react-toastify";

const DiagnosisPage = () => {
  const dispatch = useDispatch();
  const { diagnoses = [], loading, error } = useSelector(
    (state) => state.diagnosis || {}
  );

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchDiagnoses());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diagnosis?")) return;
    try {
      await dispatch(deleteDiagnosis(id)).unwrap();
      toast.success("Diagnosis deleted successfully");
      dispatch(fetchDiagnoses());
    } catch (err) {
      toast.error(err?.message || "Failed to delete diagnosis");
    }
  };

  // 🔍 Filter diagnoses by patient name, MRN, or diagnosis type
  const filteredDiagnoses = diagnoses.filter((d) => {
    const name = `${d.patient?.firstName || ""} ${d.patient?.lastName || ""}`.toLowerCase();
    const mrn = d.patient?.mrn?.toLowerCase() || "";
    const diag = d.diagnosisType?.toLowerCase() || "";
    const query = search.toLowerCase();
    return name.includes(query) || mrn.includes(query) || diag.includes(query);
  });

  return (
    <div className="p-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h1 className="text-2xl font-bold text-white">Diagnoses</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by name, MRN, or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          {/* New Diagnosis button */}
          <button
            onClick={() => {
              setSelected(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
          >
            New Diagnosis
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 bg-white text-black rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border px-2 py-2 text-left">Patient</th>
              <th className="border px-2 py-2 text-left">MRN</th>
              <th className="border px-2 py-2 text-left">Diagnosis</th>
              <th className="border px-2 py-2 text-left">Date</th>
              <th className="border px-2 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="5" className="text-center text-red-500 py-4">
                  {error || "Failed to load"}
                </td>
              </tr>
            )}
            {!loading && !error && filteredDiagnoses.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No diagnoses found
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              filteredDiagnoses.map((d) => (
                <tr key={d._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {d.patient
                      ? `${d.patient.firstName} ${d.patient.lastName}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2">{d.patient?.mrn || "N/A"}</td>
                  <td className="px-4 py-2">{d.diagnosisType}</td>
                  <td className="px-4 py-2">
                    {new Date(d.diagnosisDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelected(d);
                        setShowForm(true);
                      }}
                      className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 shadow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 shadow"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelected(d);
                        setShowDetail(true);
                      }}
                      className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 shadow"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Forms and details */}
      {showForm && (
        <DiagnosisForm
          onClose={() => {
            setShowForm(false);
            dispatch(fetchDiagnoses());
          }}
          existing={selected}
        />
      )}

      {showDetail && selected && (
        <DiagnosisDetail
          diagnosis={selected}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};

export default DiagnosisPage;
