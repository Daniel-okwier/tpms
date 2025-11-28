import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTreatments,
  archiveTreatment,
  addVisit,
} from "../redux/slices/treatmentSlice";
import TreatmentForm from "./TreatmentForm";
import TreatmentDetail from "./TreatmentDetail";
import TreatmentDashboard from "./TreatmentDashboard"; 
import { toast } from "react-toastify";

const selectTreatmentState = (state) => state.treatments;

const TreatmentList = () => {
  const dispatch = useDispatch();
  const { treatments, loading, error } = useSelector(selectTreatmentState);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true); 

  useEffect(() => {
    dispatch(fetchTreatments());
  }, [dispatch]);

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this treatment?")) return;

    try {
      await dispatch(archiveTreatment(id)).unwrap();
      toast.success("Treatment archived successfully");
      dispatch(fetchTreatments());
    } catch (err) {
      toast.error(err?.message || "Failed to archive treatment");
    }
  };

  // FILTER
  const filteredTreatments = useMemo(() => {
    const term = search.toLowerCase();
    return treatments.filter((t) => {
      const matchesSearch =
        t?.patient?.firstName?.toLowerCase().includes(term) ||
        t?.patient?.lastName?.toLowerCase().includes(term) ||
        t?.patient?.mrn?.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [treatments, search, statusFilter]);

  // Visit action handlers
  const handleAddOrUpdateVisit = async (dateIso, payload = {}) => {
    try {
      await dispatch(
        addVisit({
          treatmentId: selected._id,
          visitData: { 
            date: dateIso,
            ...payload,
          },
        })
      ).unwrap();

      toast.success("Visit updated successfully");
      dispatch(fetchTreatments());
    } catch (err) {
      toast.error(err?.message || "Failed to update visit");
    }
  };

  return (
    <div className="p-4">
      {/* Header and Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h1 className="text-3xl font-bold text-white">
          {showDashboard ? "Treatment Program Dashboard" : "Treatment List"}
        </h1>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setShowDashboard(!showDashboard)}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 shadow whitespace-nowrap"
        >
          {showDashboard ? "Switch to List View" : "Switch to Dashboard View"}
        </button>
      </div>

      {/* Conditional Rendering */}
      {showDashboard ? (
        /* RENDER DASHBOARD */
        <TreatmentDashboard treatments={treatments} loading={loading} />
      ) : (
        /* RENDER LIST */
        <>
          {/* List Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-start sm:items-center mb-4 gap-2">
            <input
              type="text"
              placeholder="Search by name or MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-md text-black"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-black"
            >
              <option value="">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="planned">Planned</option>
              <option value="defaulted">Defaulted</option>
              <option value="failed">Failed</option>
            </select>

            <button
              onClick={() => {
                setSelected(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow whitespace-nowrap"
            >
              New Treatment
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 bg-white text-black rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border px-2 py-2 text-left">Patient</th>
                  <th className="border px-2 py-2 text-left">MRN</th>
                  <th className="border px-2 py-2 text-left">Regimen</th>
                  <th className="border px-2 py-2 text-left">Start Date</th>
                  <th className="border px-2 py-2 text-left">Expected End</th>
                  <th className="border px-2 py-2 text-left">Status</th>
                  <th className="border px-2 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">Loading...</td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan="7" className="text-center text-red-500 py-4">{error}</td>
                  </tr>
                )}
                {!loading && !error && filteredTreatments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">No treatments found</td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  filteredTreatments.map((t) => (
                    <tr key={t._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {t?.patient ? `${t.patient.firstName} ${t.patient.lastName}` : "N/A"}
                      </td>
                      <td className="px-4 py-2">{t?.patient?.mrn || "N/A"}</td>
                      <td className="px-4 py-2">{t.regimen}</td>
                      <td className="px-4 py-2">{new Date(t.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{new Date(t.expectedEndDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2 capitalize">{t.status}</td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelected(t);
                            setShowForm(true);
                          }}
                          className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 shadow"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleArchive(t._id)}
                          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 shadow"
                        >
                          Archive
                        </button>

                        <button
                          onClick={() => {
                            setSelected(t);
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
        </>
      )}

      {/* Modals (remain outside the conditional block) */}
      {showForm && (
        <TreatmentForm
          existing={selected}
          onClose={() => {
            setShowForm(false);
            dispatch(fetchTreatments());
          }}
        />
      )}

      {showDetail && selected && (
        <TreatmentDetail
          treatment={selected}
          onClose={() => setShowDetail(false)}
          onAddOrUpdateVisit={handleAddOrUpdateVisit} 
        />
      )}
    </div>
  );
};

export default TreatmentList;